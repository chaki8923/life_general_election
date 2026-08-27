import { FlowButton } from "@/components/ui/flow-button";
import { useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";

const avatarPink = require("../../../assets/election/result/avatar-pink.png");
const avatarOrange = require("../../../assets/election/result/avatar-orange.png");
const avatarPurple = require("../../../assets/election/result/avatar-purple.png");
const avatarGreen = require("../../../assets/election/result/avatar-green.png");
const avatarBlue = require("../../../assets/election/result/avatar-blue.png");
const redCapAttached = require("../../../assets/election/result/red-cap-attached.png");
const rankBadgeUnion = require("../../../assets/election/result/rank-badge-union.svg");
const rankBadgeTail = require("../../../assets/election/result/rank-badge-tail.svg");
const iconFlag = require("../../../assets/election/result/icon-flag.svg");
const iconCheck = require("../../../assets/election/result/icon-check.svg");

/** Figma 1713:6380 — 帽子キャラ: 1個=10人、半分=5人、1行14個（デザインpx） */
const CAPS_PER_ROW = 14;
const CAP_SIZE = 9;
/** 帽子の見た目倍率（セルサイズは固定） */
const CAP_RENDER_SCALE = 1.08;
const CAP_GAP = 3;
const CAP_ROW_WIDTH = CAPS_PER_ROW * CAP_SIZE + (CAPS_PER_ROW - 1) * CAP_GAP;
/** 上限: 14列×4行=56個（560人相当） */
const MAX_CAP_UNITS = 56;

export type PledgeRank = 1 | 2 | 3;

type RankTheme = {
  color: string;
  avatar: number;
  avatarBg: string;
  /** Figma Mask group 内の -scale-x-100（1713:6301 など） */
  flipAvatar?: boolean;
};

/** Figma main/pink・orenge・purple */
export const PLEDGE_RANK_THEMES: Record<PledgeRank, RankTheme> = {
  1: { color: "#f4728a", avatar: avatarPink, avatarBg: "#fdf4f5" },
  2: { color: "#fb930a", avatar: avatarOrange, avatarBg: "#fff8e8" },
  3: {
    color: "#9087e6",
    avatar: avatarPurple,
    avatarBg: "#f5f3fc",
    flipAvatar: true,
  },
};

/** Figma 886:3300 — マイノリティカード main/green */
export const MINORITY_PLEDGE_THEME: RankTheme = {
  color: "#80c826",
  avatar: avatarGreen,
  avatarBg: "#f5faf0",
  flipAvatar: true,
};

/** Figma 886:3300 / 886:3133 — マイノリティ2カードのテーマ */
export const MINORITY_PLEDGE_THEMES = {
  green: MINORITY_PLEDGE_THEME,
  blue: {
    color: "#229ff7",
    avatar: avatarBlue,
    avatarBg: "#f1f7fd",
    flipAvatar: true,
  } satisfies RankTheme,
} as const;

type ResultPledgeCardProps = {
  candidate: Candidate;
  rank: PledgeRank;
  onConfirm: () => void;
};

/** Figma Group4 — 王冠付きリボン + 燕尾 + 順位数字 */
export function RankBadge({ rank, color }: { rank: number; color: string }) {
  const { s } = useDesignScale();
  return (
    <View
      className="relative items-center"
      style={{ height: s(28), width: s(17) }}
    >
      <Image
        source={rankBadgeUnion}
        className="absolute left-0 top-0"
        style={{
          height: s(18),
          width: s(17),
          tintColor: color,
        }}
        contentFit="fill"
      />
      <Image
        source={rankBadgeTail}
        className="absolute bottom-0"
        style={{
          height: s(13),
          width: s(11),
          tintColor: color,
        }}
        contentFit="fill"
      />
      <Text
        className="absolute font-bold text-white"
        style={{
          top: s(5),
          fontSize: s(11),
          lineHeight: s(11 * 1.4),
        }}
      >
        {rank}
      </Text>
    </View>
  );
}

export function PledgeTagPill({
  label,
  color,
  icon,
  iconWidth,
  iconHeight,
}: {
  label: string;
  color: string;
  icon: number;
  iconWidth: number;
  iconHeight: number;
}) {
  const { s } = useDesignScale();
  return (
    <View className="flex-row items-center" style={{ gap: s(2) }}>
      <View
        className="items-center justify-center overflow-hidden"
        style={{ height: s(10), width: s(10) }}
      >
        <Image
          source={icon}
          contentFit="contain"
          style={{
            width: s(iconWidth),
            height: s(iconHeight),
            tintColor: color,
          }}
        />
      </View>
      <Text
        className="font-flow-medium"
        style={{
          color,
          fontSize: s(9),
          lineHeight: s(9 * 1.4),
          letterSpacing: s(-0.4),
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PledgeField({
  tag,
  icon,
  iconWidth,
  iconHeight,
  text,
  color,
}: {
  tag: string;
  icon: number;
  iconWidth: number;
  iconHeight: number;
  text: string;
  color: string;
}) {
  const { s } = useDesignScale();
  return (
    <View style={{ gap: s(4) }}>
      <PledgeTagPill
        label={tag}
        color={color}
        icon={icon}
        iconWidth={iconWidth}
        iconHeight={iconHeight}
      />
      <Text
        className="font-flow text-flow-ink"
        style={{
          fontSize: s(14),
          lineHeight: s(20),
          letterSpacing: s(0.8),
        }}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * 添付帽子画像を高解像度のまま表示。
 * half=true のとき左半分だけ表示（5人分）。
 */
function CapUnit({ half = false, color }: { half?: boolean; color: string }) {
  const { s } = useDesignScale();
  const cell = s(CAP_SIZE);
  const iconSize = cell * CAP_RENDER_SCALE;
  const iconOffset = (cell - iconSize) / 2;

  const inner = (
    <View
      className="shrink-0"
      style={{ width: cell, height: cell }}
      pointerEvents="none"
    >
      <Image
        source={redCapAttached}
        contentFit="contain"
        style={{
          position: "absolute",
          left: iconOffset,
          top: iconOffset,
          width: iconSize,
          height: iconSize,
          tintColor: color,
        }}
      />
    </View>
  );

  if (half) {
    return (
      <View
        className="shrink-0 overflow-hidden"
        style={{ width: cell / 2, height: cell }}
      >
        {inner}
      </View>
    );
  }
  return inner;
}

/**
 * 投票数を帽子で可視化（Figma 1713:6380）
 * votes: 実際の票数（1帽子=10人、半帽子=5人）
 */
export function VoteCapGrid({ votes, color }: { votes: number; color: string }) {
  const { s } = useDesignScale();
  const fullCaps = Math.min(MAX_CAP_UNITS, Math.floor(votes / 10));
  const hasHalf = votes % 10 >= 5 && fullCaps < MAX_CAP_UNITS;

  return (
    <View
      className="min-w-0 flex-1 flex-row flex-wrap content-center justify-start"
      style={{ maxWidth: s(CAP_ROW_WIDTH), gap: s(CAP_GAP) }}
    >
      {Array.from({ length: fullCaps }, (_, i) => (
        <CapUnit key={i} color={color} />
      ))}
      {hasHalf && <CapUnit key="half" half color={color} />}
    </View>
  );
}

export function PledgeAvatar({
  source,
  backgroundColor,
  /** デザインpx。未指定時は 64 */
  size,
  flipHorizontal = false,
}: {
  source: number;
  backgroundColor: string;
  size?: number;
  flipHorizontal?: boolean;
}) {
  const { s } = useDesignScale();
  const designSize = size ?? 56;
  const px = s(designSize);
  const avatarImageStyle = {
    left: "10%" as const,
    top: "6%" as const,
    width: "80%" as const,
    height: "140%" as const,
    ...(flipHorizontal ? { transform: [{ scaleX: -1 as const }] } : {}),
  };

  return (
    <View
      className="overflow-hidden rounded-full"
      style={{ width: px, height: px, backgroundColor }}
    >
      {designSize >= 56 ? (
        <Image
          source={source}
          className="absolute"
          style={avatarImageStyle}
          contentFit="contain"
          contentPosition="top"
        />
      ) : (
        <Image
          source={source}
          className="h-full w-full"
          contentFit="contain"
          style={flipHorizontal ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      )}
    </View>
  );
}

function VoteCountBlock({ votes, color }: { votes: number; color: string }) {
  const { s } = useDesignScale();
  return (
    <View className="shrink-0 items-end" style={{ maxWidth: s(52), minWidth: s(40) }}>
      <View className="flex-row items-center justify-end" style={{ gap: s(1) }}>
        <Text
          className="font-flow-medium"
          style={{
            color,
            fontSize: s(18),
            lineHeight: s(18 * 1.4),
            letterSpacing: s(-0.8),
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {votes}
        </Text>
        <Text
          className="font-flow-medium text-flow-ink"
          style={{ fontSize: s(11), lineHeight: s(11 * 1.4) }}
        >
          人
        </Text>
      </View>
      <Text
        className="font-flow-medium text-flow-ink-low"
        style={{ fontSize: s(9), lineHeight: s(9 * 1.4) }}
        numberOfLines={1}
      >
        が選んだよ
      </Text>
    </View>
  );
}

/** 886:2904 — マイノリティ行のコンパクトキャップ（最大2個表示想定） */
function MinorityCapRow({ count, color }: { count: number; color: string }) {
  const { s } = useDesignScale();
  const fullCaps = Math.min(4, Math.max(1, Math.floor(count / 10)));
  const hasHalf = count % 10 >= 5 && fullCaps < 4;
  return (
    <View
      className="flex-row items-center"
      style={{ height: s(10), gap: s(2) }}
    >
      {Array.from({ length: fullCaps }, (_, i) => (
        <CapUnit key={i} color={color} />
      ))}
      {hasHalf && <CapUnit key="half" half color={color} />}
    </View>
  );
}

/**
 * 開票結果の公約カード（Figma 704:9825 / 704:9826 / 704:9827）
 */
export function ResultPledgeCard({
  candidate,
  rank,
  onConfirm,
}: ResultPledgeCardProps) {
  const { s } = useDesignScale();
  const theme = PLEDGE_RANK_THEMES[rank];

  return (
    <View
      className="rounded-2xl border border-[#f6f6f6] bg-white"
      style={{
        gap: s(14),
        paddingHorizontal: s(12),
        paddingBottom: s(18),
        paddingTop: s(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,
        elevation: 2,
      }}
    >
      <View
        className="w-full flex-row items-center overflow-hidden"
        style={{ gap: s(6) }}
      >
        <View className="shrink-0">
          <RankBadge rank={rank} color={theme.color} />
        </View>
        <View className="shrink-0">
          <PledgeAvatar
            source={theme.avatar}
            backgroundColor={theme.avatarBg}
            flipHorizontal={theme.flipAvatar}
            size={56}
          />
        </View>
        <VoteCapGrid votes={candidate.votes} color={theme.color} />
        <VoteCountBlock votes={candidate.votes} color={theme.color} />
      </View>

      <View className="w-full" style={{ gap: s(14) }}>
        <View style={{ gap: s(8) }}>
          <PledgeField
            tag="人生公約"
            icon={iconFlag}
            iconWidth={10}
            iconHeight={10}
            text={candidate.label}
            color={theme.color}
          />
          <PledgeField
            tag="掲げる政策"
            icon={iconCheck}
            iconWidth={9.8}
            iconHeight={11}
            text={candidate.action}
            color={theme.color}
          />
        </View>

        <FlowButton
          label="この公約と政策で進める"
          fillColor={theme.color}
          onPress={onConfirm}
          className="h-15 w-full"
        />
      </View>
    </View>
  );
}

type ResultMinorityPledgeCardProps = {
  candidate: Candidate;
  onConfirm: () => void;
  theme?: RankTheme;
};

/**
 * マイノリティ公約カード（Figma 886:3300）
 * 15-minority-row + 16-policy-minority を一体表示。
 */
export function ResultMinorityPledgeCard({
  candidate,
  onConfirm,
  theme = MINORITY_PLEDGE_THEME,
}: ResultMinorityPledgeCardProps) {
  const { s } = useDesignScale();
  return (
    <View
      className="rounded-2xl border border-[#f6f6f6] bg-white"
      style={{
        gap: s(12),
        paddingHorizontal: s(12),
        paddingBottom: s(16),
        paddingTop: s(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="w-full flex-row items-center justify-between overflow-hidden">
        <View
          className="min-w-0 flex-1 flex-row items-center"
          style={{ gap: s(10) }}
        >
          <PledgeAvatar
            source={theme.avatar}
            backgroundColor={theme.avatarBg}
            flipHorizontal={theme.flipAvatar}
          />
          <MinorityCapRow count={candidate.votes} color={theme.color} />
        </View>
        <VoteCountBlock votes={candidate.votes} color={theme.color} />
      </View>

      <View className="w-full" style={{ gap: s(16) }}>
        <View style={{ gap: s(8) }}>
          <PledgeField
            tag="人生公約"
            icon={iconFlag}
            iconWidth={11}
            iconHeight={11}
            text={candidate.label}
            color={theme.color}
          />
          <PledgeField
            tag="掲げる政策"
            icon={iconCheck}
            iconWidth={10.8}
            iconHeight={12}
            text={candidate.action}
            color={theme.color}
          />
        </View>

        <FlowButton
          label="この公約と政策で進める"
          fillColor={theme.color}
          onPress={onConfirm}
          className="h-15 w-full"
        />
      </View>
    </View>
  );
}
