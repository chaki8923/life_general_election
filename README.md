# 1000人生総選挙

AIが勝手に「1000人生総選挙」を開催し、あなたに近い1000人の「小さな一歩」を開票速報風に見せることで、ライフデザインの心理的ハードルを下げるアプリ。

実装計画は [docs/implementation-plan.md](docs/implementation-plan.md) を参照。

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

iOSシミュレータは `i`、Androidエミュレータは `a`、実機は Expo Go でQRコードを読み取り。

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
