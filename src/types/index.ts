/** ユーザーの基本属性（オンボーディングで入力） */
export type UserProfile = {
  nickname: string;
  ageRange: string;
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

/** 総選挙の候補（似た境遇の1000人が踏み出した小さな一歩） */
export type Candidate = {
  id: string;
  label: string; // 例: 「求人サイトで1件だけ求人を見た」
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

/** wishリスト（人生公約） */
export type Wish = {
  id: string;
  text: string;
  sourceElectionId?: string;
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
