/** 興味関心カテゴリ（選挙フロー①の選択肢） */

/** カード内の絶対配置。Figmaのカード171x103基準で持ち、実機ではカード幅に比例して縮尺する */
export type InterestArt = { x: number; y: number; w: number; h: number };

export type Interest = {
  /** themeStats集計用の安定キー（AI生成worryはidが毎回変わるため集計はこのキーで行う） */
  id: string;
  /** AIプロンプト・Firestore・Worry.category に流れる正式名。変えると集計が分裂する */
  label: string;
  /** カードに出す短縮名（Figma表記） */
  shortLabel: string;
  icon: number;
  /** 選択時に右から現れるテーマ別のとぴょっこ */
  character: number;
  /** 選択時のカード背景 */
  activeBg: string;
  iconIdle: InterestArt;
  iconActive: InterestArt;
  /** とぴょっこは位置と幅が共通で、高さだけテーマごとに違う */
  characterHeight: number;
};

/** Figmaのカード実寸 */
export const CARD_WIDTH = 171;
export const CARD_HEIGHT = 103;
/** 選択時のとぴょっこの配置（高さは Interest.characterHeight） */
export const CHARACTER_X = 78;
export const CHARACTER_Y = 7;
export const CHARACTER_WIDTH = 92;
/** ラベルの左上マージン */
export const LABEL_INSET = 10;

export const INTERESTS: Interest[] = [
  {
    id: "money",
    label: "お金",
    shortLabel: "お金",
    icon: require("../../assets/election/theme-money.webp"),
    character: require("../../assets/election/topyokko-money.webp"),
    activeBg: "#fff1de",
    iconIdle: { x: 50, y: 36, w: 71, h: 59 },
    iconActive: { x: 10, y: 48, w: 54, h: 45 },
    characterHeight: 136,
  },
  {
    id: "career",
    label: "仕事・キャリア",
    shortLabel: "仕事",
    icon: require("../../assets/election/theme-career.webp"),
    character: require("../../assets/election/topyokko-career.webp"),
    activeBg: "#fee9d6",
    iconIdle: { x: 33, y: 38, w: 105, h: 55 },
    iconActive: { x: 10, y: 45, w: 79, h: 41 },
    characterHeight: 140,
  },
  {
    id: "love",
    label: "恋愛・結婚",
    shortLabel: "恋愛",
    icon: require("../../assets/election/theme-love.webp"),
    character: require("../../assets/election/topyokko-love.webp"),
    activeBg: "#ffe7f4",
    iconIdle: { x: 46, y: 44, w: 80, h: 43 },
    iconActive: { x: 10, y: 49, w: 60, h: 32 },
    characterHeight: 128,
  },
  {
    id: "relationship",
    label: "人間関係",
    shortLabel: "人間関係",
    icon: require("../../assets/election/theme-relationship.webp"),
    character: require("../../assets/election/topyokko-relationship.webp"),
    activeBg: "#f5e3fb",
    iconIdle: { x: 59, y: 42, w: 53, h: 46 },
    iconActive: { x: 10, y: 48, w: 40, h: 34 },
    characterHeight: 135,
  },
  {
    id: "hobby",
    label: "趣味・創作",
    shortLabel: "趣味",
    icon: require("../../assets/election/theme-hobby.png"),
    character: require("../../assets/election/topyokko-hobby.webp"),
    activeBg: "#e7f9eb",
    iconIdle: { x: 50, y: 42, w: 71, h: 49 },
    iconActive: { x: 10, y: 49, w: 53, h: 37 },
    characterHeight: 137,
  },
  {
    id: "health",
    label: "健康",
    shortLabel: "健康",
    icon: require("../../assets/election/theme-health.png"),
    character: require("../../assets/election/topyokko-health.webp"),
    activeBg: "#eefde0",
    iconIdle: { x: 38, y: 40, w: 96, h: 54 },
    iconActive: { x: 10, y: 47, w: 72, h: 40 },
    characterHeight: 138,
  },
  {
    id: "growth",
    label: "学び・自己成長",
    shortLabel: "自己成長",
    icon: require("../../assets/election/theme-growth.webp"),
    character: require("../../assets/election/topyokko-growth.webp"),
    activeBg: "#e9f3fc",
    iconIdle: { x: 46, y: 42, w: 79, h: 50 },
    iconActive: { x: 10, y: 48, w: 59, h: 38 },
    characterHeight: 136,
  },
  {
    id: "other",
    label: "その他",
    shortLabel: "その他",
    icon: require("../../assets/election/theme-other.webp"),
    character: require("../../assets/election/topyokko-other.webp"),
    activeBg: "#f2f3f5",
    iconIdle: { x: 60, y: 46, w: 50, h: 43 },
    iconActive: { x: 10, y: 51, w: 38, h: 32 },
    characterHeight: 138,
  },
];

/** お悩み選択で使う全画像（アイコン8枚＋選択時のとぴょっこ8枚）。先読み用 */
export const INTEREST_IMAGES: number[] = INTERESTS.flatMap((i) => [
  i.icon,
  i.character,
]);
