/** 興味関心カテゴリ（選挙フロー①の選択肢） */

export type Interest = {
  /** themeStats集計用の安定キー（AI生成worryはidが毎回変わるため集計はこのキーで行う） */
  id: string;
  label: string;
  icon: number;
};

export const INTERESTS: Interest[] = [
  {
    id: "money",
    label: "お金",
    icon: require("../../assets/icons/interest-money.svg"),
  },
  {
    id: "career",
    label: "仕事・キャリア",
    icon: require("../../assets/icons/interest-career.svg"),
  },
  {
    id: "love",
    label: "恋愛・結婚",
    icon: require("../../assets/icons/interest-love.svg"),
  },
  {
    id: "relationship",
    label: "人間関係",
    icon: require("../../assets/icons/interest-relationship.svg"),
  },
  {
    id: "hobby",
    label: "趣味・創作",
    icon: require("../../assets/icons/interest-hobby.svg"),
  },
  {
    id: "health",
    label: "健康",
    icon: require("../../assets/icons/interest-health.svg"),
  },
  {
    id: "growth",
    label: "学び・自己成長",
    icon: require("../../assets/icons/interest-growth.svg"),
  },
  {
    id: "other",
    label: "その他",
    icon: require("../../assets/icons/interest-other.svg"),
  },
];
