/** 投票結果カードの順位別テーマ（Figma: oh 世界 / 807-13446） */
export type ResultRank = 1 | 2 | 3;

export type ResultCardTheme = {
  accent: string;
  accentBg: string;
  buttonBg: string;
  voteFill: string;
};

export const RANK_THEMES: Record<ResultRank, ResultCardTheme> = {
  1: {
    accent: "#f4728a",
    accentBg: "bg-flow-pink",
    buttonBg: "bg-flow-pink",
    voteFill: "#f4728a",
  },
  2: {
    accent: "#f5a623",
    accentBg: "bg-flow-orange",
    buttonBg: "bg-flow-orange",
    voteFill: "#f5a623",
  },
  3: {
    accent: "#9381e9",
    accentBg: "bg-flow-purple",
    buttonBg: "bg-flow-purple",
    voteFill: "#9381e9",
  },
};

export const MINORITY_THEME: ResultCardTheme = {
  accent: "#8cc63f",
  accentBg: "bg-flow-green",
  buttonBg: "bg-flow-green",
  voteFill: "#8cc63f",
};
