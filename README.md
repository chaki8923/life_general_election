# 1000人生総選挙

AIが勝手に「1000人生総選挙」を開催し、あなたに近い1000人の「小さな一歩」を開票速報風に見せることで、ライフデザインの心理的ハードルを下げるアプリ。

実装計画は [docs/implementation-plan.md](docs/implementation-plan.md) を参照。

TeamsからClaudeへ実装依頼できます。

## 技術スタック

- Expo (SDK 57) / React Native / TypeScript
- Expo Router（ファイルベースルーティング）
- NativeWind v5 + Tailwind CSS v4（`src/tw` のラッパー経由で `className` を使用）
- Firebase（Firestore + 匿名認証、未設定時はローカル保存にフォールバック）
- Gemini API（未設定時はモックデータにフォールバック）

## セットアップ

```bash
cp .env.example .env   # 必要に応じてAPIキーを設定（空でも起動可）
```

## 起動

iOSシミュレータは `i`、Androidエミュレータは `a`、実機は Expo Go でQRコードを読み取り。

## origin/main の自動同期

Teams「/claude …」の依頼が issue → PR → main へ自動マージされた後、ローカル環境にも自動で取り込みたい場合に使用する。

```bash
npm run sync         # origin/main を1回だけチェックして取り込む
npm run sync:watch   # 60秒間隔で監視し続ける(開発中に起動しておく)
```

`npm run sync` / `npm run sync:watch` の動作:

1. `git fetch origin main` で origin/main の最新状態を取得
2. ローカル `main` を fast-forward で最新化(作業ブランチにいる場合はブランチを切り替えずに更新)
3. 作業中のブランチへ `origin/main` をマージ

安全のため、以下の場合は自動マージを見送り通知のみ行う:

- 追跡ファイルに未コミットの変更がある場合(未追跡ファイルのみなら続行)
- merge / rebase が進行中の場合
- コンフリクトが発生した場合(`git merge --abort` で元の状態に自動で戻す)

結果はターミナルのログに加え、macOSでは通知センターにも表示される。

`npm run sync:watch` はこの一連の処理を60秒間隔で繰り返し実行し続けるため、開発中に起動しておけば origin/main の更新をポーリングで自動的に取り込める(停止するには `Ctrl+C`)。

## ディレクトリ構成

```
src/
├── app/          # Expo Router のルート（画面）
├── components/   # 汎用UIコンポーネント（ui/ と選挙演出系 election/）
├── features/     # 機能単位のロジック＋専用コンポーネント
├── services/     # firebase/（認証・Firestore） ai/（Gemini・モック）
├── stores/       # Zustand ストア
├── hooks/        # 共有フック
├── types/        # 型定義
├── constants/    # 選択肢マスタ・定数
├── utils/
└── tw/           # NativeWind 用コンポーネントラッパー
```
