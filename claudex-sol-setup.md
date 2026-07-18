# Claude Code で GPT-5.6 Sol を使うセットアップ手順（2026-07-16 実施）

Claude Code に GPT-5.6 Sol を組み込んだ手順の記録。2本立て構成:

1. **claudex（CLIProxyAPI 経由・安全版）** — Sol をメインモデルとして使う専用起動コマンド
2. **OpenAI 公式 Codex プラグイン** — 普段の `claude`（Fable）に GPT をレビュー係として追加

---

## 構成の方針（安全版を採用）

元記事の「ルートB-2」は普段の Claude 利用も含めて全通信をプロキシ経由にする構成だが、
**Anthropic のサブスク OAuth トークンをサードパーティプロキシに通すことは利用規約違反にあたり、
トークンブロック（BAN）事例が報告されている**ため、以下の安全版に変更した。

- `claudex` = プロキシ経由の **Sol 専用**起動（プロキシには ChatGPT 認証のみ。`--claude-login` はしない）
- 普段の `claude` = 従来どおり Anthropic 直接続（プロキシを一切通らない）
- つまり「/model で切替」ではなく「**コマンドで使い分け**」

---

## 1. CLIProxyAPI（claudex ルート）

### 1-1. インストール

```bash
brew install cliproxyapi
```

- homebrew-core に正式収録済み。記事にある `brew tap router-for-me/tap` は**不要**（tap は既に存在せず 404）
- リポジトリ: https://github.com/router-for-me/CLIProxyAPI

### 1-2. 設定ファイル

パス: `/opt/homebrew/etc/cliproxyapi.conf`（= `$(brew --prefix)/etc/cliproxyapi.conf`）

変更した箇所:

```yaml
host: "127.0.0.1"   # デフォルトは全インターフェース待受 → localhost 限定に変更（社内LANから到達不可にする）
port: 8317           # デフォルトのまま

api-keys:
  - "4cd07f6ac42e5be1ee4fd0f9a5b7b2c1"   # プレースホルダー3つを削除し、生成キー1つに置換
```

> **ANTHROPIC_AUTH_TOKEN とは何か**: Anthropic の本物の API キーではなく、
> Claude Code → ローカルプロキシ間の認証用の「自分で決めた合言葉」。
> ここ（config の `api-keys`）と alias の `ANTHROPIC_AUTH_TOKEN` に**同じ文字列**を書く。
> 中身は任意（今回は `openssl rand -hex 16` で生成）。
> ※このキーで localhost:8317 のプロキシを使えるので、このファイルを共有する場合は伏せること。

### 1-3. ChatGPT (Codex) 認証 & 常駐起動

```bash
cliproxyapi --codex-login        # ブラウザで ChatGPT 有料アカウントの OAuth ログイン
brew services start cliproxyapi  # 常駐起動
```

- トークンは `~/.cli-proxy-api/` に JSON で保存される
- `--claude-login` は**実行しない**（安全版のため）

### 1-4. alias 定義

ログインシェルは **fish**（`$SHELL` は bash だが対話シェルは fish なので注意）。

`~/.config/fish/config.fish`:

```fish
# --- claudex: CLIProxyAPI 経由で GPT-5.6 Sol を使う Claude Code（普段の claude は無変更） ---
alias claudex='env ANTHROPIC_BASE_URL=http://127.0.0.1:8317 ANTHROPIC_AUTH_TOKEN=4cd07f6ac42e5be1ee4fd0f9a5b7b2c1 ANTHROPIC_CUSTOM_MODEL_OPTION=gpt-5.6-sol ANTHROPIC_CUSTOM_MODEL_OPTION_NAME="GPT-5.6 Sol (proxy)" claude --model gpt-5.6-sol'
```

`~/.bash_profile` にも同等の bash 版を追記済み（bash を使う場面用。複数行 `\` 継続形式）。

> **注意**: `~/.bash_profile` を fish で `source` すると bash 構文エラーになる（rbenv 初期化や case 文が原因）。
> fish では `source ~/.config/fish/config.fish` を使うこと。

### 1-5. /model 切替の挙動

- claudex セッション内で `/model sonnet` 等に切り替えると、ピッカーからは Sol に戻れない問題があった
- 対策1: **`/model gpt-5.6-sol` と引数付きで直接打てばいつでも戻れる**
  （カスタム `ANTHROPIC_BASE_URL` 使用時はモデル名検証がスキップされるため）
- 対策2: alias に `ANTHROPIC_CUSTOM_MODEL_OPTION=gpt-5.6-sol` を設定済み
  → `/model` ピッカー下部に「GPT-5.6 Sol (proxy)」が常時表示される
- ただし claudex 内で Claude モデルに切り替えても、通信は Claude 認証を持たないプロキシに流れるため
  正常応答しない想定。**Claude モデルは普段の `claude` で使うこと**

参考: [Claude Code Model configuration](https://code.claude.com/docs/en/model-config.md)

---

## 2. OpenAI 公式 Codex プラグイン（Fable 計画 → Sol/GPT レビュー用）

### 2-1. インストール（Claude Code セッション内で実行）

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins        ← これを忘れると /codex: コマンドが Unknown command になる
/codex:setup
```

### 2-2. 前提条件（確認済み・全て充足）

| 項目 | 状態 |
|---|---|
| Node.js / npm | v25.1.0 / 11.6.2 |
| Codex CLI | codex-cli 0.144.4 |
| 認証 | ChatGPT ログイン有効（chaki-ry@ibjapan.jp） |
| プラグイン | codex 1.0.6 |

### 2-3. 使えるコマンド（記事と異なるので注意）

現行バージョン（1.0.6）に記事の `/codex:review` / `/codex:adversarial-review` は**存在しない**。

| コマンド | 用途 |
|---|---|
| `/codex:rescue` | 調査・レビュー・修正依頼を Codex (GPT) サブエージェントに委譲。「この計画を批判的にレビューして」等 |
| `/codex:setup` | Codex CLI の準備状態チェック |
| `/codex:setup --enable-review-gate` | Claude が作業を終える前に毎回 Codex レビューを必須にするゲートを有効化 |

使用量は ChatGPT サブスクの Codex 枠を消費。CLIProxyAPI とは独立して動く（公式ルートなので規約面の問題なし）。

---

## 日常の使い方まとめ

| やりたいこと | 方法 |
|---|---|
| 普段の開発（Claude/Fable） | `claude` で起動（従来どおり） |
| Sol をメインで使う | `claudex` で起動 |
| Fable で計画 → GPT にレビューさせる | `claude` セッション内で `/codex:rescue` に依頼 |
| 出荷前に毎回 GPT レビューを挟む | `/codex:setup --enable-review-gate` |
| claudex 内で誤って別モデルにしたとき | `/model gpt-5.6-sol` で復帰 |

## トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| `source ~/.bash_profile` で構文エラー | 対話シェルが fish のため。`source ~/.config/fish/config.fish` を使う |
| `/codex:*` が Unknown command | `/reload-plugins` 未実行。実行するか Claude Code を再起動 |
| claudex で認証エラー | `brew services list` でプロキシ起動確認。config の api-keys と alias のトークン一致を確認 |
| claudex 内の Claude モデルが応答しない | 仕様（プロキシに Claude 認証を入れていない安全版のため）。`claude` を使う |