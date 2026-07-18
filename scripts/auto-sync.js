#!/usr/bin/env node

/**
 * origin/main の更新を監視し、ローカルへ自動で取り込む。
 *
 * Teams「/claude …」→ issue → PR 自動マージ(main へ squash)の後、
 * このスクリプトを起動しておけばローカルにも自動反映される。
 *
 * 使い方:
 *   npm run sync        1回だけチェックして終了
 *   npm run sync:watch  60秒間隔で監視し続ける(開発中に起動しておく)
 *
 * 1周回の動作:
 *   1. git fetch origin main
 *   2. ローカル main を fast-forward で最新化(main 以外にいるときは checkout 不要の
 *      `git fetch origin main:main` を使う)
 *   3. 作業中ブランチへ origin/main をマージ
 *
 * 安全設計(自動マージせず通知だけ出すケース):
 *   - 追跡ファイルに未コミット変更がある(未追跡ファイルだけなら続行する)
 *   - merge / rebase が進行中
 *   - コンフリクトした場合は `git merge --abort` で元の状態に戻す
 *
 * 結果は console ログと macOS 通知(osascript)で知らせる。
 */

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const POLL_INTERVAL_MS = 60_000;
const REMOTE = 'origin';
const BASE_BRANCH = 'main';

// 同じ origin/main の SHA に対する同種の通知を毎周回繰り返さないための記録
let lastNotifiedKey = null;

function git(args, { allowFail = false } = {}) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: root }, (error, stdout, stderr) => {
      if (error && !allowFail) {
        reject(new Error(`git ${args.join(' ')} failed: ${stderr.trim() || error.message}`));
        return;
      }
      resolve({ ok: !error, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

// macOS の通知センターに出す。失敗しても同期処理には影響させない
function notifyMac(title, message) {
  if (process.platform !== 'darwin') return;
  const script = `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`;
  execFile('osascript', ['-e', script], () => {});
}

function notifyOnce(key, title, message) {
  console.log(`[auto-sync] ${title}: ${message}`);
  if (key === lastNotifiedKey) return;
  lastNotifiedKey = key;
  notifyMac(title, message);
}

async function isAncestor(ancestor, descendant) {
  const { ok } = await git(['merge-base', '--is-ancestor', ancestor, descendant], {
    allowFail: true,
  });
  return ok;
}

async function hasTrackedChanges() {
  const { stdout } = await git(['status', '--porcelain', '--untracked-files=no']);
  return stdout !== '';
}

async function mergeOrRebaseInProgress() {
  const { stdout: gitDir } = await git(['rev-parse', '--git-dir']);
  const abs = path.resolve(root, gitDir);
  return ['MERGE_HEAD', 'rebase-merge', 'rebase-apply'].some((p) =>
    fs.existsSync(path.join(abs, p))
  );
}

async function syncOnce() {
  try {
    await git(['fetch', REMOTE, BASE_BRANCH]);
  } catch (e) {
    console.warn(`[auto-sync] fetch に失敗しました(ネットワーク?): ${e.message}`);
    return;
  }

  const { stdout: remoteSha } = await git(['rev-parse', `${REMOTE}/${BASE_BRANCH}`]);
  const shortSha = remoteSha.slice(0, 7);
  const { stdout: currentBranch } = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const onBase = currentBranch === BASE_BRANCH;

  // --- ローカル main の最新化 ---
  const baseUpToDate = await isAncestor(remoteSha, BASE_BRANCH);
  if (!baseUpToDate) {
    if (onBase) {
      if (await hasTrackedChanges()) {
        notifyOnce(
          `${remoteSha}:base-dirty`,
          'auto-sync: スキップ',
          `${BASE_BRANCH} に未コミット変更があるため取り込みを見送りました (${shortSha})`
        );
        return;
      }
      const { ok } = await git(['merge', '--ff-only', `${REMOTE}/${BASE_BRANCH}`], {
        allowFail: true,
      });
      if (!ok) {
        notifyOnce(
          `${remoteSha}:base-diverged`,
          'auto-sync: 要確認',
          `ローカル ${BASE_BRANCH} が origin と分岐しています。手動で解消してください`
        );
        return;
      }
      notifyOnce(`${remoteSha}:base-merged`, 'auto-sync: 取り込み完了', `${BASE_BRANCH} を ${shortSha} に更新しました`);
    } else {
      // checkout せずに main を fast-forward。分岐していると失敗する
      const { ok } = await git(['fetch', REMOTE, `${BASE_BRANCH}:${BASE_BRANCH}`], {
        allowFail: true,
      });
      if (!ok) {
        notifyOnce(
          `${remoteSha}:base-diverged`,
          'auto-sync: 要確認',
          `ローカル ${BASE_BRANCH} が origin と分岐しているため更新できません`
        );
        // main の更新には失敗しても、作業ブランチへの取り込みは続行できる
      } else {
        console.log(`[auto-sync] ローカル ${BASE_BRANCH} を ${shortSha} に更新しました`);
      }
    }
  }

  // --- 作業中ブランチへのマージ ---
  if (onBase || currentBranch === 'HEAD') {
    if (baseUpToDate) console.log(`[auto-sync] 変更なし (${shortSha})`);
    return;
  }

  if (await isAncestor(remoteSha, 'HEAD')) {
    console.log(`[auto-sync] ${currentBranch} は最新です (${shortSha})`);
    return;
  }

  if (await mergeOrRebaseInProgress()) {
    notifyOnce(
      `${remoteSha}:in-progress`,
      'auto-sync: スキップ',
      `merge/rebase 進行中のため ${currentBranch} への取り込みを見送りました`
    );
    return;
  }

  if (await hasTrackedChanges()) {
    notifyOnce(
      `${remoteSha}:dirty`,
      'auto-sync: スキップ',
      `未コミット変更があるため ${currentBranch} への取り込みを見送りました。コミット後に自動で再試行します (${shortSha})`
    );
    return;
  }

  const { ok, stderr } = await git(['merge', '--no-edit', `${REMOTE}/${BASE_BRANCH}`], {
    allowFail: true,
  });
  if (!ok) {
    await git(['merge', '--abort'], { allowFail: true });
    notifyOnce(
      `${remoteSha}:conflict`,
      'auto-sync: コンフリクト',
      `${currentBranch} への自動マージに失敗したため元に戻しました。手動で git merge ${BASE_BRANCH} してください`
    );
    if (stderr) console.warn(`[auto-sync] ${stderr}`);
    return;
  }

  notifyOnce(
    `${remoteSha}:merged`,
    'auto-sync: 取り込み完了',
    `origin/${BASE_BRANCH} (${shortSha}) を ${currentBranch} にマージしました`
  );
}

async function main() {
  const once = process.argv.includes('--once');
  console.log(
    `[auto-sync] origin/${BASE_BRANCH} の監視を開始します${once ? '(1回のみ)' : `(${POLL_INTERVAL_MS / 1000}秒間隔)`}`
  );

  // setInterval ではなく逐次 setTimeout にして、周回の処理が重なるのを防ぐ
  for (;;) {
    try {
      await syncOnce();
    } catch (e) {
      console.warn(`[auto-sync] エラー: ${e.message}`);
    }
    if (once) break;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

if (require.main === module) {
  main();
}
