import { FlowButton } from "@/components/ui/flow-button";
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

/** Figma 1713:6380 — 帽子キャラ: 1個=10人、半分=5人、1行14個 */
const CAPS_PER_ROW = 14;
const CAP_SIZE =  10;
/** 帽子の見た目倍率（セルサイズは固定） */
const CAP_RENDER_SCALE = 1.3;
const CAP_GAP = 4;
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
  return (
    <View className="relative h-8 w-[19.5px] items-center">
      <Image
        source={rankBadgeUnion}
        className="absolute left-0 top-0 h-[20.55px] w-[19.5px]"
        contentFit="fill"
        style={{ tintColor: color }}
      />
      <Image
        source={rankBadgeTail}
        className="absolute bottom-0 h-[14.89px] w-[12.62px]"
        contentFit="fill"
        style={{ tintColor: color }}
      />
      <Text className="absolute top-1.5 text-[12px] font-bold leading-[1.4] text-white">
        {rank}
      </Text>
    </View>
  );
}

export function PledgeTagPill({
  label,
  color,
  icon,
  iconClassName,
}: {
  label: string;
  color: string;
  icon: number;
  iconClassName: string;
}) {
  return (
    <View
      className="h-[22px] w-[98px] flex-row items-center justify-center gap-0.5 rounded-full border px-2"
      style={{ borderColor: color }}
    >
      <View className="h-[13px] w-[13px] items-center justify-center overflow-hidden">
        <Image
          source={icon}
          className={iconClassName}
          contentFit="contain"
          style={{ tintColor: color }}
        />
      </View>
      <Text
        className="font-flow-medium text-[10px] leading-[1.4] tracking-[-0.4px]"
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
}

export function PledgeField({
  tag,
  icon,
  iconClassName,
  text,
  color,
}: {
  tag: string;
  icon: number;
  iconClassName: string;
  text: string;
  color: string;
}) {
  return (
    <View className="gap-1">
      <PledgeTagPill
        label={tag}
        color={color}
        icon={icon}
        iconClassName={iconClassName}
      />
      <Text className="font-flow text-base leading-6 tracking-[0.8px] text-flow-ink">
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
  const iconSize = CAP_SIZE * CAP_RENDER_SCALE;
  const iconOffset = (CAP_SIZE - iconSize) / 2;

  const inner = (
    <View
      className="shrink-0"
      style={{ width: CAP_SIZE, height: CAP_SIZE }}
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
        style={{ width: CAP_SIZE / 2, height: CAP_SIZE }}
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
  const fullCaps = Math.min(MAX_CAP_UNITS, Math.floor(votes / 10));
  const hasHalf = votes % 10 >= 5 && fullCaps < MAX_CAP_UNITS;

  return (
    <View
      className="ml-auto flex-row flex-wrap content-center justify-end"
      style={{ width: CAP_ROW_WIDTH, gap: CAP_GAP }}
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
  size = 64,
  flipHorizontal = false,
}: {
  source: number;
  backgroundColor: string;
  size?: number;
  flipHorizontal?: boolean;
}) {
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
      style={{ width: size, height: size, backgroundColor }}
    >
      {size >= 64 ? (
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
  return (
    <View className="w-[50px] items-end">
      <View className="flex-row items-center justify-end gap-px">
        <Text
          className="font-flow-medium text-xl leading-[1.4] tracking-[-0.8px]"
          style={{ color }}
        >
          {votes}
        </Text>
        <Text className="font-flow-medium text-xs leading-[1.4] text-flow-ink">
          人
        </Text>
      </View>
      <Text className="font-flow-medium text-[10px] leading-[1.4] text-flow-ink-low">
        が選んだよ
      </Text>
    </View>
  );
}

/** 886:2904 — マイノリティ行のコンパクトキャップ（最大2個表示想定） */
function MinorityCapRow({ count, color }: { count: number; color: string }) {
  const fullCaps = Math.min(4, Math.max(1, Math.floor(count / 10)));
  const hasHalf = count % 10 >= 5 && fullCaps < 4;
  return (
    <View className="h-2.5 flex-row items-center gap-0.5">
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
  const theme = PLEDGE_RANK_THEMES[rank];

  return (
    <View
      className="gap-3 rounded-2xl border border-[#f6f6f6] bg-white px-3 pb-4 pt-5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,
        elevation: 2,
      }}
    >
      <View className="w-full flex-row items-center gap-3">
        <RankBadge rank={rank} color={theme.color} />
        <PledgeAvatar
          source={theme.avatar}
          backgroundColor={theme.avatarBg}
          flipHorizontal={theme.flipAvatar}
        />
        <VoteCapGrid votes={candidate.votes} color={theme.color} />
        <VoteCountBlock votes={candidate.votes} color={theme.color} />
      </View>

      <View className="h-px w-full bg-[#eef0f2]" />

      <View className="w-full gap-4">
        <View className="gap-2">
          <PledgeField
            tag="人生公約"
            icon={iconFlag}
            iconClassName="h-[13px] w-[13px]"
            text={candidate.label}
            color={theme.color}
          />
          <PledgeField
            tag="掲げる政策"
            icon={iconCheck}
            iconClassName="h-[14px] w-[12.6px]"
            text={candidate.action}
            color={theme.color}
          />
        </View>

        <FlowButton
          label="この公約と政策で進める"
          fillColor={theme.color}
          onPress={onConfirm}
          className="w-full"
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
  return (
    <View
      className="gap-3 rounded-2xl border border-[#f6f6f6] bg-white px-3 pb-4 pt-5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <PledgeAvatar
            source={theme.avatar}
            backgroundColor={theme.avatarBg}
            flipHorizontal={theme.flipAvatar}
          />
          <MinorityCapRow count={candidate.votes} color={theme.color} />
        </View>
        <VoteCountBlock votes={candidate.votes} color={theme.color} />
      </View>

      <View className="w-full gap-4">
        <View className="gap-2">
          <PledgeField
            tag="人生公約"
            icon={iconFlag}
            iconClassName="h-[13px] w-[13px]"
            text={candidate.label}
            color={theme.color}
          />
          <PledgeField
            tag="掲げる政策"
            icon={iconCheck}
            iconClassName="h-[14px] w-[12.6px]"
            text={candidate.action}
            color={theme.color}
          />
        </View>

        <FlowButton
          label="この公約と政策で進める"
          fillColor={theme.color}
          onPress={onConfirm}
          className="w-full"
        />
      </View>
    </View>
  );
}
