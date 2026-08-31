import {
  HistoryTimelineBar,
  HISTORY_TIMELINE_LEAD_INSET,
} from "@/features/achievements/history-timeline-bar";
import { FONT, useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";

/** 見出しとタイムライン（空バー含む）の間隔。履歴あり時の carousel 上端とも一致 */
export const HISTORY_TITLE_TO_CONTENT_GAP = 20;

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
        paddingHorizontal: s(HISTORY_TIMELINE_LEAD_INSET),
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
    <View className="w-full" style={{ gap: s(HISTORY_TITLE_TO_CONTENT_GAP) }}>
      <HistorySectionTitle />
      <HistoryTimelineBar />
    </View>
  );
}
