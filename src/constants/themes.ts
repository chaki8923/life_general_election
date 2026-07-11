import type { ThemeSuggestion } from "@/types";

/** 入力せずに選ぶだけで総選挙を始められる、一般的なライフデザインの悩み候補 */
export const PRESET_WORRIES: ThemeSuggestion[] = [
  {
    id: "marriage",
    label: "そろそろ結婚を考えるべき？",
    category: "結婚",
    emoji: "💍",
  },
  {
    id: "career",
    label: "今の仕事、このままでいいの？",
    category: "転職",
    emoji: "💼",
  },
  {
    id: "money",
    label: "貯金がなさすぎて不安…",
    category: "お金",
    emoji: "💰",
  },
  {
    id: "moving",
    label: "一人暮らし・引っ越ししたい",
    category: "住まい",
    emoji: "🏠",
  },
  {
    id: "health",
    label: "運動不足で体がヤバい",
    category: "健康",
    emoji: "💪",
  },
  {
    id: "growth",
    label: "何か新しいことを始めたい",
    category: "自分磨き",
    emoji: "✨",
  },
];
