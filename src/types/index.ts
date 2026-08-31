import type { PresetAvatarId } from "@/features/avatar/preset-avatars";

/** ユーザーの基本属性（オンボーディングで入力） */
export type UserProfile = {
  nickname: string;
  /** birthDateから算出した年代。AIプロンプトとFirestoreミラーの互換のため保持する */
  ageRange: string;
  /** "YYYY-MM-DD"。Dateにすると保存/復元で型が嘘になるので文字列。v1ユーザーは持たない */
  birthDate?: string;
  gender?: string;
  relationshipStatus?: string;
  savingsRange?: string;
  hobbies?: string[];
  motivation?: string;
};

/** AIが提案する悩みテーマ（勝手にマニフェスト生成） */
export type ThemeSuggestion = {
  id: string;
  label: string; // 例: 「そろそろプロポーズしないとヤバい？」
  category: string; // 例: 結婚 / 転職 / お金
  emoji: string;
};

/** 総選挙の候補（似た境遇の1000人が選んだ「これから踏み出す小さな一歩」） */
export type Candidate = {
  id: string;
  label: string; // これから掲げる公約なので現在形。例: 「求人サイトで1件だけ求人を見る」
  votes: number;
  isMinority: boolean; // マイノリティな一歩（低得票・ハードル激低枠）
  comment: string; // 投票者の一言
  action: string; // 「今日の一歩」の具体的アクション
};

/** 1回の総選挙 */
export type Election = {
  id: string;
  themeId: string;
  themeLabel: string;
  category: string;
  candidates: Candidate[];
  totalVotes: number;
  createdAt: number;
};

export type WishStatus = "active" | "done" | "excused";

/** 投票結果画面の公約カード色（ランキング1〜3位 + マイノリティ green/blue） */
export type PledgeThemeId = "pink" | "orange" | "purple" | "green" | "blue";

export type PosterPaletteId =
  | "red"
  | "navy"
  | "pink"
  | "orange"
  | "purple"
  | "green"
  | "blue";

export type PosterImageSource =
  | { kind: "character" }
  | { kind: "photo"; uri: string }
  /** assets/avatar/ の既製イラスト。IDだけ保存し、実体はrequireで解決する */
  | { kind: "preset"; id: PresetAvatarId };

export type PosterSettings = {
  image: PosterImageSource;
  /** 空文字はプロフィールのニックネームを使う */
  candidateName: string;
  paletteId: PosterPaletteId;
};

/** wishリスト（人生公約） */
export type Wish = {
  id: string;
  text: string;
  policy?: string;
  deadline?: number;
  excuse?: string;
  excusedAt?: number;
  sourceElectionId?: string;
  /** 投票結果画面で選んだ公約カードの色テーマ */
  pledgeThemeId?: PledgeThemeId;
  posterSettings?: PosterSettings;
  /** @deprecated version 1で保存した完成ポスター。新UIの描画元には使わない */
  posterUri?: string;
  status: WishStatus;
  createdAt: number;
  doneAt?: number;
};

/** アバターの状態（wish達成・総選挙参加で成長） */
export type AvatarState = {
  level: number;
  exp: number;
};

/** ユーザーが入力・選択した悩み（総選挙の開催テーマ） */
export type Worry = {
  id: string;
  text: string;
  category: string;
  source: "preset" | "custom" | "ai";
  createdAt: number;
};

/** AIが興味関心とプロフィールから提案する悩み候補 */
export type WorrySuggestion = {
  id: string;
  label: string;
  category: string; // 選択した興味関心カテゴリ
};

/** 過去の悩みランキングの1行 */
export type ThemeStat = {
  themeId: string;
  label: string;
  category: string;
  count: number;
};

/** KPI計測イベント */
export type KpiEventType = "step_tap" | "share" | "theme_view";
