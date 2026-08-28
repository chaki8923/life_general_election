import { HistoryDoneCharacter } from "@/features/achievements/history-happy-character";
import { HistorySadCharacter } from "@/features/achievements/history-sad-character";
import { useDesignScale } from "@/features/election/layout";
import type { HistoryCardTheme } from "@/features/election/pledge-themes";
import { formatDate } from "@/utils/date";
import type { Wish } from "@/types";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";

const iconDone = require("../../../assets/poster/icon-done.svg");
const iconFailed = require("../../../assets/poster/icon-failed.svg");

/** Figma 2317:23421 — カード幅 */
export const HISTORY_CARD_WIDTH = 300;
/** Figma 2317:23421 — 固定高さ（2行タイトル + フッター96） */
export const HISTORY_CARD_HEIGHT = 290;
const CARD_PADDING = 20;
const CARD_GAP = 16;
const INNER_GAP = 4;
const TITLE_GAP = 8;
const FOOTER_GAP = 16;
const BUBBLE_PADDING = 10;
/** 吹き出しのしっぽ（右向き） */
const BUBBLE_TAIL = 8;
/** タイトル最大2行（lineHeight 32） */
const TITLE_MIN_HEIGHT = 64;
/** 策定日・達成日ブロック（2行 + gap 4） */
const DATE_BLOCK_MIN_HEIGHT = 38;
/** フッター（キャラ高さ 96） */
const FOOTER_HEIGHT = 96;

export type { HistoryCardTheme };

type HistoryPledgeCardProps = {
  wish: Wish;
  theme: HistoryCardTheme;
};

/**
 * Figma 2317:23421 — 過去の履歴カード（できた / できなかった）。
 */
export function HistoryPledgeCard({ wish, theme }: HistoryPledgeCardProps) {
  const { s } = useDesignScale();
  const done = wish.status === "done";
  const achievementDate = done ? wish.doneAt : wish.excusedAt;
  const policyText = wish.policy?.trim() || wish.text;

  return (
    <View
      className="border border-[#f6f6f6] bg-white"
      style={{
        width: s(HISTORY_CARD_WIDTH),
        height: s(HISTORY_CARD_HEIGHT),
        gap: s(CARD_GAP),
        padding: s(CARD_PADDING),
        borderRadius: s(20),
      }}
    >
      <View style={{ gap: s(INNER_GAP), flex: 1, width: "100%" }}>
        <View className="flex-row items-center" style={{ gap: s(4) }}>
          <Image
            source={done ? iconDone : iconFailed}
            style={{ width: s(24), height: s(24), tintColor: theme.accent }}
            contentFit="contain"
          />
          <Text
            className="font-flow"
            style={{
              color: theme.accent,
              fontSize: s(14),
              lineHeight: s(14 * 1.4),
            }}
          >
            {done ? "できた！" : "できなかった"}
          </Text>
        </View>

        <View style={{ gap: s(TITLE_GAP), flex: 1 }}>
          <Text
            className="font-flow text-flow-ink"
            numberOfLines={2}
            style={{
              fontSize: s(20),
              lineHeight: s(32),
              letterSpacing: s(1),
              minHeight: s(TITLE_MIN_HEIGHT),
            }}
          >
            {policyText}
          </Text>
          <View
            style={{
              gap: s(4),
              minHeight: s(DATE_BLOCK_MIN_HEIGHT),
            }}
          >
            <Text
              className="font-flow-regular text-[#999999]"
              numberOfLines={1}
              style={{ fontSize: s(12), lineHeight: s(12 * 1.4) }}
            >
              策定日：{formatDate(wish.createdAt)}
            </Text>
            <Text
              className="font-flow-regular text-[#999999]"
              numberOfLines={1}
              style={{
                fontSize: s(12),
                lineHeight: s(12 * 1.4),
                opacity: achievementDate != null ? 1 : 0,
              }}
            >
              達成日：
              {achievementDate != null ? formatDate(achievementDate) : "—"}
            </Text>
          </View>
        </View>
      </View>

      {done ? (
        <View
          className="items-end justify-end"
          style={{ height: s(FOOTER_HEIGHT), width: "100%" }}
        >
          <HistoryDoneCharacter themeId={theme.pledgeThemeId} />
        </View>
      ) : (
        <View
          className="flex-row items-center"
          style={{
            gap: s(FOOTER_GAP),
            height: s(FOOTER_HEIGHT),
            width: "100%",
          }}
        >
          <View
            className="relative min-w-0 flex-1 justify-center"
            style={{
              height: s(FOOTER_HEIGHT),
              backgroundColor: theme.bubbleBg ?? "#fff0dc",
              borderRadius: s(8),
              padding: s(BUBBLE_PADDING),
            }}
          >
            <Text
              className="font-flow text-[#333333]"
              numberOfLines={3}
              style={{
                fontSize: s(12),
                lineHeight: s(20),
                letterSpacing: s(0.6),
              }}
            >
              {"できなかったのは…\n"}
              {wish.excuse?.trim() || "理由が記録されていません"}
            </Text>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: -s(BUBBLE_TAIL),
                top: "50%",
                marginTop: -s(BUBBLE_TAIL),
                width: 0,
                height: 0,
                borderTopWidth: s(BUBBLE_TAIL),
                borderBottomWidth: s(BUBBLE_TAIL),
                borderLeftWidth: s(BUBBLE_TAIL),
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                borderLeftColor: theme.bubbleBg ?? "#fff0dc",
              }}
            />
          </View>
          <HistorySadCharacter themeId={theme.pledgeThemeId} />
        </View>
      )}
    </View>
  );
}
