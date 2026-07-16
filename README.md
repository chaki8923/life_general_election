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
npm install
cp .env.example .env   # 必要に応じてAPIキーを設定（空でも起動可）
```

## 起動

```bash
npx expo start
```

iOSシミュレータは `i`、Androidエミュレータは `a`、実機は Expo Go でQRコードを読み取り。

## 動作確認

初めてこのプロジェクトを触る場合は、以下の手順でローカル環境での動作確認ができます。

1. 依存パッケージのインストール

   ```bash
   npm install
   ```

2. 開発サーバーの起動

   ```bash
   npx expo start
   ```

3. 起動後、ターミナルに表示されるメニューから確認したい環境を選択

   - `i` : iOS シミュレータで起動
   - `a` : Android エミュレータで起動
   - `w` : Web ブラウザで起動
   - 実機で確認する場合は、Expo Go アプリでQRコードを読み取り

4. アプリ起動後、選挙演出画面などが正しく表示されることを確認する

   Firebase / Gemini API のキーが未設定でも、ローカル保存・モックデータにフォールバックするため、`.env` が空の状態でも動作確認が可能です。

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
