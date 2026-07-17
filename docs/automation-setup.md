# Teams → Claude Code 自動実装ワークフロー セットアップガイド

Teams でメッセージを送るだけで、Claude Code が実装 → テスト → PR作成 → 自動マージまで実行する仕組みの構築手順です。

## 全体アーキテクチャ

```
┌──────────┐   POST    ┌────────────────────┐   API   ┌─────────────────┐
│  Teams   │─────────▶│ Cloudflare Worker  │────────▶│  GitHub Issue   │
│(手動起動)│           │  (中継サーバー)    │         │(@claude 付き)   │
└──────────┘           └────────────────────┘         └────────┬────────┘
                                                                │ trigger
                                                                ▼
┌──────────────────┐   push   ┌───────────────────────┐   run   ┌─────────────┐
│  main ブランチ   │◀─────────│ auto-merge workflow   │◀────────│ Claude Code │
│  (自動反映)      │  merge   │   (CI通過後にマージ) │         │   Action    │
└──────────────────┘          └───────────────────────┘         └──────┬──────┘
                                          ▲                              │ create
                                          │                              ▼
                                   ┌──────┴──────┐                ┌──────────────┐
                                   │  CI (lint+  │◀───────────────│ PR (auto-    │
                                   │  typecheck) │                │ merge label) │
                                   └─────────────┘                └──────────────┘
```

## 構成ファイル

| ファイル | 役割 |
|---|---|
| `.github/workflows/claude.yml` | Issue の `@claude` メンションで起動 → 実装 → PR作成 |
| `.github/workflows/ci.yml` | PR時に `npx tsc --noEmit` と `npm run lint` を実行 |
| `.github/workflows/auto-merge.yml` | `auto-merge` ラベル付き PR を CI通過後に squash merge (Free プラン対応) |
| `cloudflare-worker/src/index.ts` | Teams からの POST を受けて GitHub Issue を作成 |
| `cloudflare-worker/wrangler.toml` | Cloudflare Worker のデプロイ設定 |

## 必要なアカウント / ツール

- GitHub アカウント(このリポジトリの管理権限)
- Anthropic Console アカウント + **クレジット残高 $5 以上**
- Cloudflare アカウント(無料プランで OK)
- Microsoft 365 / Teams アカウント
- ローカルに Node.js 20+ と npm

## セットアップ手順

### フェーズ1: GitHub 側の準備

#### 1-1. Claude GitHub App のインストール

https://github.com/apps/claude を開き、このリポジトリにインストール。

#### 1-2. GitHub Secrets 登録

`Settings → Secrets and variables → Actions → New repository secret` で以下を登録:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Console で発行した `sk-ant-...` |

直接リンク: https://github.com/chaki8923/life_general_election/settings/secrets/actions

#### 1-3. Workflow permissions を有効化

`Settings → Actions → General → Workflow permissions` で以下を設定:

- ☑ **Read and write permissions**
- ☑ **Allow GitHub Actions to create and approve pull requests**

#### 1-4. squash merge を有効化

`Settings → General → Pull Requests` で以下を設定:

- ☑ **Allow squash merging**

(他のマージ方式はチェックを外して良い)

#### 1-5. Personal Access Token (PAT) 発行

Cloudflare Worker が Issue を作成するために必要。

1. https://github.com/settings/personal-access-tokens/new を開く
2. 以下を設定:
   - **Token name**: `teams-to-github-worker`
   - **Expiration**: `90 days` など
   - **Repository access**: `Only select repositories` → `life_general_election`
   - **Repository permissions**:
     - **Issues**: `Read and write`
     - **Metadata**: `Read-only` (自動でON)
3. **Generate token** → `github_pat_xxxxx...` をコピー(この画面を閉じると二度と見られない)

### フェーズ2: Anthropic クレジット追加

Claude Code Action は従量課金 API を消費するため、事前チャージが必要。

1. https://console.anthropic.com/settings/billing を開く
2. **Add to credit balance** をクリック
3. 最低 $5 をチャージ

**トラブルシューティング**:

- ボタンが disable の場合、CVC 欄が「セキュリティコードを確定する」表示なら Enter キー押下で確定
- Stripe Link の保存済みカードが原因の場合、「変更」→ 手動入力に切り替え
- 税額計算がおかしい場合、住所を再入力

**目安コスト**:

- Issue 1件あたり $0.05〜$0.30 程度(Claude Sonnet 4使用時)
- $5 で当面数十件は実行可能

### フェーズ3: Cloudflare Worker のデプロイ

Teams と GitHub をつなぐ中継サーバー。無料枠 100k req/日で運用可能。

#### 3-1. Cloudflare アカウント作成

https://dash.cloudflare.com/sign-up でメール登録(クレカ不要)。

#### 3-2. Worker のデプロイ

```bash
cd /Users/chaki-ry/Desktop/life_general_election/cloudflare-worker

# 依存インストール
npm install

# Cloudflare にログイン
npx wrangler login
# → ブラウザで Allow をクリック

# GitHub PAT を Secret として登録
npx wrangler secret put GITHUB_TOKEN
# → プロンプトに `github_pat_xxxxx...` を貼り付け

# 共有シークレット(Teams と Worker の認証)を生成して登録
openssl rand -hex 32
# → 出力された 64文字の文字列をメモしてから↓に貼り付け
npx wrangler secret put SHARED_SECRET

# デプロイ
npx wrangler deploy
```

デプロイ成功後、以下のような URL が表示される:

```
https://teams-to-github.<your-subdomain>.workers.dev
```

**この URL とメモした SHARED_SECRET は Teams 側の設定で使う**。

#### 3-3. Worker 単体で動作確認

ターミナルから curl で叩いて GitHub に Issue が立つか確認:

```bash
curl -X POST "https://teams-to-github.<your-subdomain>.workers.dev" \
  -H "Content-Type: application/json" \
  -H "x-shared-secret: <SHARED_SECRETの値>" \
  -d '{"text":"テスト依頼: READMEに動作確認セクションを追加","user":"テスト太郎"}'
```

レスポンスに `"ok": true` と `issue_url` が返れば成功。GitHub でも新規 Issue が確認できる。

### フェーズ4: Teams からの起動設定

Power Automate の Instant Cloud Flow を作成する。**HTTP アクション(標準版)はプレミアム機能なので使わず、Cloudflare Worker 経由にする**。

#### 4-1. Power Automate でフロー作成

1. https://make.powerautomate.com/ を開く(Teams アカウントで自動ログイン)
2. 左メニュー **作成** → **インスタントクラウドフロー**
3. **フロー名**: `Claude Code に依頼`
4. **トリガー**: `選択したメッセージの場合 (Microsoft Teams)` を選択
5. **作成** をクリック

#### 4-2. HTTP アクション追加

無料プランで使える回避策として、以下のいずれかを使う:

**方法A: Office 365 Outlook「HTTP要求を送信します」を使う**
- 制約: Microsoft Graph 系エンドポイント専用のため GitHub には直接送れず不可

**方法B: Teams の Incoming Webhook で直接 Cloudflare を叩く(推奨)**

Power Automate ではなく、Teams チャネルの Incoming Webhook 機能を使う:

1. Teams チャネルの `…` メニュー → **コネクタ** → **Incoming Webhook** を追加
2. Webhook 名: `Claude Code Bridge`
3. Webhook URL が発行される(これは Teams が受信するもので、今回の用途とは逆方向)

→ この方法は「Teams → 外部」ではなく「外部 → Teams」なので用途不一致。**Power Automate プレミアム加入が必要**。

**方法C: Power Automate + Microsoft 提供の HTTP コネクタ(有料プラン)**

- Power Automate Premium (月額 $15/ユーザー)が必要
- 「HTTP」アクションで直接 Cloudflare Worker を叩く

**方法D: 代替案 - Teams Adaptive Card + Bot Framework**

- 高度なカスタマイズが可能だが実装コスト大

#### 4-3. 推奨: 一旦 GitHub Issue を直接立てる運用

Teams 連携が有料プランを要するため、以下のいずれかで運用:

1. **PC**: GitHub Web UI で Issue に `@claude 実装内容` と書く
2. **モバイル**: GitHub モバイルアプリから Issue 作成
3. **既存 Slack がある場合**: Slack の GitHub App から Issue 作成

Cloudflare Worker は curl で叩けるので、コマンドライン派なら以下をシェルエイリアスに登録:

```bash
alias claude-ask='curl -X POST "https://teams-to-github.<your-subdomain>.workers.dev" \
  -H "Content-Type: application/json" \
  -H "x-shared-secret: '"$SHARED_SECRET"'" \
  -d'
```

使用例:

```bash
claude-ask '{"text":"投票結果画面の背景色を変更","user":"chaki"}'
```

## 使い方(セットアップ完了後)

### 手動で依頼する場合

1. GitHub の Issues タブ → **New issue**
2. タイトル: 依頼概要
3. 本文: `@claude` に続けて依頼内容を記述
   ```
   @claude
   投票結果画面(app/results.tsx)の背景色を #F5F5F5 に変更してください。
   ```
4. **Submit** をクリック

### 自動処理の流れ

1. Issue 作成 → Claude Code Action が自動起動
2. Claude が実装ブランチ (`claude/issue-N-...`) を作成
3. 実装 → `npx tsc --noEmit` と `npm run lint` を実行
4. PR を作成し `auto-merge` ラベルを付与
5. CI (`ci.yml`) が走り、lint と型チェックを実行
6. CI 通過後、`auto-merge.yml` が squash merge を実行
7. `main` ブランチに反映

### 途中で介入したい場合

- **PR に修正依頼**: PR コメントで `@claude ○○を修正して`
- **Draft PR にする**: auto-merge を止めるには PR を Draft 化 or `auto-merge` ラベルを外す
- **緊急停止**: `.github/workflows/*.yml` をリネームすればワークフロー全体が停止

## セキュリティ考慮事項

### リスク

1. **Claude が意図しないコードを書く可能性**
   - CI (lint + typecheck) は通っても、機能的に間違っている可能性
   - **推奨**: 本番デプロイは手動トリガーにし、main マージ ≠ 本番反映にする

2. **PAT / API キーの漏洩**
   - GitHub Secrets と Cloudflare Secrets に保管しているので通常は安全
   - **推奨**: 90日で自動失効させ、定期ローテーション

3. **Cloudflare Worker への直接アクセス**
   - `SHARED_SECRET` ヘッダーで認証しているが、漏れると誰でも Issue 作成可能
   - **推奨**: 定期的に `openssl rand -hex 32` で再生成し、`wrangler secret put` で上書き

4. **Anthropic クレジットの浪費**
   - 大量の Issue を立てられると API コストが膨らむ
   - **推奨**: Anthropic Console で使用量アラートを設定

### 緊急停止手段

| 状況 | 対処 |
|---|---|
| Claude が暴走している | `.github/workflows/claude.yml` を削除して push |
| Cloudflare Worker が悪用されている | `npx wrangler delete` で Worker 削除 |
| Anthropic クレジットを止めたい | Console → Billing → Auto reload を OFF |
| main への自動マージを止めたい | `.github/workflows/auto-merge.yml` を削除 |

## 現在の進捗状況(2026-07-15 時点)

- [x] GitHub Actions workflow 3種類作成
- [x] Cloudflare Worker コード作成
- [x] Cloudflare Worker デプロイ + Secrets 登録
- [x] curl で Worker → GitHub Issue 作成の動作確認
- [ ] **Anthropic クレジット追加**(現在ここで停止中)
- [ ] Claude Code Action が実際に PR を作成することを確認
- [ ] auto-merge が正常動作することを確認
- [ ] Teams からの起動方法確定(Power Automate プレミアム or 代替案)

## トラブルシューティング

### Claude Code Action が失敗する

**「Credit balance is too low」**
→ Anthropic クレジット不足。https://console.anthropic.com/settings/billing でチャージ

**「Claude GitHub App not installed」**
→ https://github.com/apps/claude をリポジトリにインストール

**「Permission denied」**
→ Settings → Actions → General → Workflow permissions を確認

### auto-merge が動かない

- PR に `auto-merge` ラベルが付いているか
- PR が Draft でないか
- CI (lint + typecheck) が通っているか
- Settings → General → **Allow squash merging** が有効か

### Cloudflare Worker が 401 を返す

- リクエストヘッダーに `x-shared-secret` が付いているか
- 値が `wrangler secret put SHARED_SECRET` で登録したものと一致するか

### Cloudflare Worker が 502 を返す

- GitHub PAT の権限に Issues (Read and write) があるか
- PAT の Expiration が切れていないか
- GitHub の障害情報を確認: https://www.githubstatus.com/

## Expo 起動通知（ローカル → Teams グループチャット）

上記の Teams → GitHub 連携とは**逆方向**の仕組み。`npm run start:tunnel` で開発サーバーを起動すると、トンネルURL（`exp://xxx.exp.direct`）と接続用QRコードを Teams のグループチャットへ自動通知する。

```
┌──────────────────────┐  POST   ┌─────────────────────┐  投稿   ┌──────────────────┐
│ npm run start:tunnel │────────▶│ Power Automate      │────────▶│ Teams            │
│ (トンネルURL検出後)  │         │ Workflows (Webhook) │         │ グループチャット │
└──────────────────────┘         └─────────────────────┘         └──────────────────┘
```

- 実装: `scripts/start-tunnel-notify.js`（`expo start -c --tunnel` を起動し、ngrok ローカルAPI からトンネルURLを検出して通知）
- `TEAMS_WEBHOOK_URL` 未設定時は通知をスキップして expo だけ起動するため、セットアップ前でも安全に使える
- 依頼受信時に不採用だった「Webhook」は、今回は「外部 → Teams」方向のためプレミアム不要の無料枠で使える

### セットアップ手順

#### 1. Power Automate でフロー作成

1. https://make.powerautomate.com/ を開く（Teams アカウントでログイン）
2. **作成** → **インスタントクラウドフロー** →トリガーに **「Teams Webhook 要求を受信したとき」(When a Teams webhook request is received)** を選択
3. トリガーの設定で **「フローをトリガーできるユーザー」= 「すべてのユーザー」** を選択
4. アクションに **「チャットまたはチャネルでカードを投稿する」(Post card in a chat or channel)** を追加
   - **投稿者**: Flow bot
   - **投稿先**: Group chat
   - **Group chat**: 通知したいグループチャットを選択
   - **アダプティブ カード**: 式エディタで `triggerBody()?['attachments'][0]['content']` を設定
5. 保存すると **HTTP POST URL** が発行されるのでコピー

#### 2. ローカルの `.env` に設定

```bash
# .env に追記（.env は gitignore 済み）
TEAMS_WEBHOOK_URL=<発行された HTTP POST URL>
TEAMS_NOTIFY_NAME=chaki   # 省略可（省略時は OS ユーザー名）
```

#### 3. 動作確認

```bash
npm run start:tunnel
```

- 起動後しばらくして `[teams-notify] トンネルURL検出: exp://…` と表示され、グループチャットにカードが届く
- カードの URL がターミナルの `Metro waiting on exp://…` と一致することを確認
- QRコードを iOS カメラ / Android の Expo Go でスキャンしてアプリが開けば成功

expo への追加引数はそのまま渡せる: `npm run start:tunnel -- --port 8082`

### 注意事項

- QRコード画像は quickchart.io（外部QR生成API）で生成するため、**トンネルURLが第三者サービスに渡る**。exp.direct のトンネルURLは URL を知っていれば誰でも到達できる一時的なものなので許容範囲だが、気になる場合は通知カードの URL テキストのみを使うこと
- カード内の「Expo Go で開く」ボタン（`exp://` スキーム）は Teams デスクトップ版では開けないことがある。**QRコードが主動線**
- 通知の POST に失敗しても expo は落ちない（警告を表示して継続）

### トラブルシューティング

**通知が届かない / HTTP 4xx が返る**
→ Power Automate 側のフローが有効か、トリガーの「フローをトリガーできるユーザー」が「すべてのユーザー」になっているか確認

**`[teams-notify] トンネルURLを検出できなかったため通知を諦めます` と出る**
→ トンネル自体が張れていない可能性。ターミナルに `Tunnel ready.` が出ているか確認。expo が ngrok 以外のトンネル実装に切り替わった場合もここに落ちる（expo の動作には影響なし）

**カードは届くが QR 画像が表示されない**
→ quickchart.io への到達性の問題。時間を置いて再実行するか、カード内の URL テキストを直接使う

## 参考リンク

- Claude Code Action: https://github.com/anthropics/claude-code-action
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Anthropic Console: https://console.anthropic.com/
- Expo v57 docs (このプロジェクトの参照仕様): https://docs.expo.dev/versions/v57.0.0/
