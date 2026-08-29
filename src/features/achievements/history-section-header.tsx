import { HistoryTimelineBar } from "@/features/achievements/history-timeline-bar";
import { FONT, useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";

/** 見出しと進捗バーの間隔（Figma 2317:23425 付近） */
const TITLE_TO_BAR_GAP = 18;

/** Figma 2317:23491 — 「過去の履歴」見出し */
export function HistorySectionTitle() {
  const { s } = useDesignScale();

  return (
    <Text
      className="text-flow-ink"
      style={{
        fontFamily: FONT.bold,
        fontSize: s(18),
        lineHeight: s(24),
        letterSpacing: s(0.8),
        paddingHorizontal: s(20),
      }}
    >
      過去の履歴
    </Text>
  );
}

/**
 * Figma 2317:23491 + 2317:23461 — 空状態用「過去の履歴」見出しと日付進捗バー。
 */
export function HistorySectionHeader() {
  const { s } = useDesignScale();

  return (
    <View
      className="w-full"
      style={{ gap: s(TITLE_TO_BAR_GAP), paddingHorizontal: s(20) }}
    >
      <Text
        className="text-flow-ink"
        style={{
          fontFamily: FONT.bold,
          fontSize: s(18),
          lineHeight: s(24),
          letterSpacing: s(0.8),
        }}
      >
        過去の履歴
      </Text>
      <HistoryTimelineBar />
    </View>
  );
}
