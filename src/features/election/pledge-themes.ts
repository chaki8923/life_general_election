import type { PledgeThemeId, Wish } from "@/types";

const avatarPink = require("../../../assets/election/result/avatar-pink.png");
const avatarOrange = require("../../../assets/election/result/avatar-orange.png");
const avatarPurple = require("../../../assets/election/result/avatar-purple.png");
const avatarGreen = require("../../../assets/election/result/avatar-green.png");
const avatarBlue = require("../../../assets/election/result/avatar-blue.png");

export type PledgeRank = 1 | 2 | 3;

export type PledgeTheme = {
  id: PledgeThemeId;
  color: string;
  avatar: number;
  avatarBg: string;
  flipAvatar?: boolean;
  /** できなかったカードの吹き出し背景 */
  bubbleBg: string;
};

/** 投票結果画面の公約カード色（ランキング・マイノリティ） */
export const PLEDGE_THEMES: Record<PledgeThemeId, PledgeTheme> = {
  pink: {
    id: "pink",
    color: "#f4728a",
    avatar: avatarPink,
    avatarBg: "#fdf4f5",
    bubbleBg: "#ffe4eb",
  },
  orange: {
    id: "orange",
    color: "#fb930a",
    avatar: avatarOrange,
    avatarBg: "#fff8e8",
    bubbleBg: "#fff0dc",
  },
  purple: {
    id: "purple",
    color: "#9087e6",
    avatar: avatarPurple,
    avatarBg: "#f5f3fc",
    flipAvatar: true,
    bubbleBg: "#f1efff",
  },
  green: {
    id: "green",
    color: "#80c826",
    avatar: avatarGreen,
    avatarBg: "#f5faf0",
    flipAvatar: true,
    bubbleBg: "#e1f6c8",
  },
  blue: {
    id: "blue",
    color: "#229ff7",
    avatar: avatarBlue,
    avatarBg: "#f1f7fd",
    flipAvatar: true,
    bubbleBg: "#f1f7fd",
  },
};

export const PLEDGE_RANK_THEMES: Record<PledgeRank, PledgeTheme> = {
  1: PLEDGE_THEMES.pink,
  2: PLEDGE_THEMES.orange,
  3: PLEDGE_THEMES.purple,
};

export const PLEDGE_RANK_THEME_IDS: Record<PledgeRank, PledgeThemeId> = {
  1: "pink",
  2: "orange",
  3: "purple",
};

export const MINORITY_PLEDGE_THEME = PLEDGE_THEMES.green;

export const MINORITY_PLEDGE_THEMES = {
  green: PLEDGE_THEMES.green,
  blue: PLEDGE_THEMES.blue,
} as const;

export type HistoryCardTheme = {
  accent: string;
  bubbleBg?: string;
  pledgeThemeId: PledgeThemeId;
};

const LEGACY_DONE_THEME_IDS: PledgeThemeId[] = ["pink", "blue"];
const LEGACY_EXCUSED_THEME_IDS: PledgeThemeId[] = ["orange", "purple", "green"];

/** 公約登録時の色を優先し、未保存の既存データは従来のローテーションにフォールバック */
export function historyCardThemeForWish(
  wish: Wish,
  fallbackIndex: number
): HistoryCardTheme {
  if (wish.pledgeThemeId) {
    const theme = PLEDGE_THEMES[wish.pledgeThemeId];
    return {
      accent: theme.color,
      bubbleBg: theme.bubbleBg,
      pledgeThemeId: wish.pledgeThemeId,
    };
  }

  const legacyIds =
    wish.status === "done"
      ? LEGACY_DONE_THEME_IDS
      : LEGACY_EXCUSED_THEME_IDS;
  const pledgeThemeId = legacyIds[fallbackIndex % legacyIds.length];
  const theme = PLEDGE_THEMES[pledgeThemeId];
  return {
    accent: theme.color,
    bubbleBg: theme.bubbleBg,
    pledgeThemeId,
  };
}
