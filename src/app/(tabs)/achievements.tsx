import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { CharacterWalk } from "@/features/achievements/character-walk";
import { HistoryEmptyState } from "@/features/achievements/history-empty-state";
import { HistoryRecordCarousel } from "@/features/achievements/history-record-carousel";
import { HistorySectionHeader, HistorySectionTitle, HISTORY_TITLE_TO_CONTENT_GAP } from "@/features/achievements/history-section-header";
import { getResolvedWishes } from "@/features/achievements/wish-history";
import { useDesignScale } from "@/features/election/layout";
import { useWishStore } from "@/stores/wishes";
import { ScrollView, View } from "@/tw";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** 動画下から見出し・日付バーまでの余白（デザインpx） */
const HISTORY_SECTION_TOP_PADDING = 24;
/** 進捗バー下からコンテンツまでの間隔（デザインpx） */
const CONTENT_SECTION_GAP = 20;
/** 空状態 — バー下端から文言上端まで（Figma 2317:23483 y=510 − バー下端 417） */
const EMPTY_STATE_TOP_GAP = 93;

/**
 * 過去の履歴タブ。
 * 達成・未達成の履歴がないときは空状態。あるときはカード一覧を表示。
 */
export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useDesignScale();
  const bottomPadding = useTabBarBottomPadding();
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);

  const resolvedWishes = useMemo(() => getResolvedWishes(wishes), [wishes]);
  const hasResolvedHistory = resolvedWishes.length > 0;

  const showEmpty = hasHydrated && !hasResolvedHistory;
  const contentGap = showEmpty
    ? s(EMPTY_STATE_TOP_GAP)
    : s(CONTENT_SECTION_GAP);

  return (
    <View className="flex-1 bg-flow-bg" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <CharacterWalk />
        <View
          style={{
            paddingTop: s(HISTORY_SECTION_TOP_PADDING),
            gap: contentGap,
          }}
        >
          {showEmpty ? (
            <>
              <HistorySectionHeader />
              <HistoryEmptyState />
            </>
          ) : hasResolvedHistory ? (
            <View style={{ gap: s(HISTORY_TITLE_TO_CONTENT_GAP) }}>
              <HistorySectionTitle />
              <HistoryRecordCarousel wishes={resolvedWishes} />
            </View>
          ) : (
            <HistorySectionHeader />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
