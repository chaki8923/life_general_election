#!/usr/bin/env node

/**
 * `expo start -c --tunnel` を起動し、トンネルURLが確定したら Teams へ通知する。
 *
 * 使い方: npm run start:tunnel [-- <expoへの追加引数>]
 *
 * 必要な環境変数（.env または シェル環境）:
 *   TEAMS_WEBHOOK_URL  Power Automate Workflows「Webhook要求の受信時」のURL。
 *                      未設定なら通知をスキップして expo だけ起動する。
 *   TEAMS_NOTIFY_NAME  通知に表示する起動者名（省略時はOSユーザー名）。
 *
 * トンネルURLの取得は expo の stdout パースではなく ngrok のローカルAPI
 * (http://127.0.0.1:4040/api/tunnels) のポーリングで行う。stdout を pipe すると
 * Expo CLI が非対話モードになり、キー操作・QR・URL表示がすべて消えるため。
 *
 * Ctrl+C 等での停止時にも停止カードを送る（起動通知を送ったセッションのみ）。
 * kill -9 やターミナル強制終了ではプロセスが即死するため停止通知は送れない。
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const root = path.resolve(__dirname, '..');

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 180_000;
const NGROK_API_URL = 'http://127.0.0.1:4040/api/tunnels';

let webhookUrl = null;
let pollTimer = null;
let notified = false;
let tunnelUrl = null;

function main() {
  // .env はシェルで export 済みの値を上書きしない。不存在は正常系（CI等）
  try {
    process.loadEnvFile(path.join(root, '.env'));
  } catch {}

  webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      '[teams-notify] TEAMS_WEBHOOK_URL が未設定のため Teams 通知をスキップします（expo は通常どおり起動します）'
    );
  }

  const child = spawn('npx', ['expo', 'start', '-c', '--tunnel', ...process.argv.slice(2)], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  // expo は起動後 stdin を raw mode にするため Ctrl+C は expo 自身が処理する。
  // raw mode 突入前の初期段階ではプロセスグループ全体に SIGINT が届くので、
  // ラッパーが子より先に死なないよう無視して child の close を待つ。
  process.on('SIGINT', () => {});
  process.on('SIGTERM', () => child.kill('SIGTERM'));

  child.on('close', async (code, signal) => {
    stopPolling();
    // 起動通知を送ったセッションのみ停止も通知する（トンネル未確立での終了はノイズになるため）
    if (notified && webhookUrl) {
      console.log('[teams-notify] 停止を Teams へ通知します');
      // Ctrl+C 後にユーザーを待たせないよう起動時より短いタイムアウト
      await sendTeamsNotification(buildStopPayload(tunnelUrl), 5000);
    }
    process.exit(signal ? 130 : code ?? 0);
  });

  if (webhookUrl) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    pollTimer = setInterval(() => {
      if (Date.now() > deadline) {
        stopPolling();
        console.warn(
          '[teams-notify] トンネルURLを検出できなかったため通知を諦めます（expo はそのまま動作します）'
        );
        return;
      }
      poll().catch(() => {});
    }, POLL_INTERVAL_MS);
    // ポーリングだけが残って expo 終了後もプロセスが生き続けないように
    pollTimer.unref();
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// expo が生成した .expo/settings.json の urlRandomness と照合し、
// 無関係な ngrok トンネル（別プロジェクト・古いエージェント）の誤検出を防ぐ
function readUrlRandomness() {
  try {
    const settings = JSON.parse(
      fs.readFileSync(path.join(root, '.expo', 'settings.json'), 'utf8')
    );
    return typeof settings.urlRandomness === 'string'
      ? settings.urlRandomness.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

async function poll() {
  if (notified) return;
  let json;
  try {
    const res = await fetch(NGROK_API_URL, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return;
    json = await res.json();
  } catch {
    // 起動直後は 4040 が未 listen（ECONNREFUSED）。次の周回へ
    return;
  }
  const tunnels = Array.isArray(json.tunnels) ? json.tunnels : [];
  const randomness = readUrlRandomness();
  const hit = tunnels.find((t) => {
    try {
      const host = new URL(t.public_url).hostname.toLowerCase();
      return host.endsWith('.exp.direct') && (!randomness || host.startsWith(`${randomness}-`));
    } catch {
      return false;
    }
  });
  if (!hit || notified) return;

  notified = true;
  stopPolling();
  tunnelUrl = `exp://${new URL(hit.public_url).hostname}`;
  console.log(`\n[teams-notify] トンネルURL検出: ${tunnelUrl} → Teams へ通知します`);
  await sendTeamsNotification(buildPayload(tunnelUrl), 10_000);
}

async function sendTeamsNotification(payload, timeoutMs) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      console.log('[teams-notify] Teams への通知に成功しました');
    } else {
      console.warn(
        `[teams-notify] Teams 通知に失敗 (HTTP ${res.status})。expo はそのまま動作します`
      );
    }
  } catch (e) {
    console.warn(`[teams-notify] Teams 通知に失敗: ${e.message}。expo はそのまま動作します`);
  }
}

function buildPayload(expUrl) {
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(expUrl)}&size=300`;
  const starter = process.env.TEAMS_NOTIFY_NAME || os.userInfo().username;
  const startedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          // Workflows (Flow bot) 経由で確実に描画される上限バージョン
          version: '1.4',
          msteams: { width: 'Full' },
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: '今から開発します!その間は下のQRコードからアプリを開けます!',
            },
            {
              type: 'TextBlock',
              isSubtle: true,
              wrap: true,
              text: `起動者: ${starter} / ${startedAt}`,
            },
            // exp:// スキームのリンクは Teams デスクトップで開けないことがあるため
            // コピー用のプレーンテキストとして表示し、QR を主動線にする
            { type: 'TextBlock', wrap: true, fontType: 'Monospace', text: expUrl },
            { type: 'Image', url: qrUrl, altText: 'Expo Go QRコード', size: 'Large' },
            {
              type: 'TextBlock',
              isSubtle: true,
              wrap: true,
              size: 'Small',
              text: 'iOS: カメラでQRを読み取り / Android: Expo Go アプリでスキャン',
            },
          ],
          actions: [{ type: 'Action.OpenUrl', title: 'Expo Go で開く', url: expUrl }],
        },
      },
    ],
  };
}

// Ctrl+C 等でサーバーを停止したときに送る簡易カード（QRなし）
function buildStopPayload(expUrl) {
  const starter = process.env.TEAMS_NOTIFY_NAME || os.userInfo().username;
  const stoppedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: { width: 'Full' },
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: '開発を終了しました！アプリへの接続は停止しています',
            },
            {
              type: 'TextBlock',
              isSubtle: true,
              wrap: true,
              text: `起動者: ${starter} / ${stoppedAt}`,
            },
            { type: 'TextBlock', wrap: true, fontType: 'Monospace', text: expUrl ?? '' },
          ],
        },
      },
    ],
  };
}

// ペイロード単体テスト用（require しても expo は起動しない）
module.exports = { buildPayload, buildStopPayload };

if (require.main === module) {
  main();
}
