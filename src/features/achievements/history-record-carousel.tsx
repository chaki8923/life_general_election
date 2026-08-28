import { useMemo, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView as RNScrollView } from "react-native";
import { useDesignScale } from "@/features/election/layout";
import { HistoryLinkedTimelineTrack } from "@/features/achievements/history-timeline-bar";
import { getWishAchievementDate } from "@/features/achievements/wish-history";
import type { Wish } from "@/types";
import { View } from "@/tw";
import {
  HistoryPledgeCard,
  HISTORY_CARD_WIDTH,
} from "@/features/achievements/history-pledge-card";
import { historyCardThemeForWish } from "@/features/election/pledge-themes";

/** Figma 2317:23377 — タイムラインとカードの間隔 */
const SECTION_GAP = 17;
/** Figma 2317:23407 — カード間隔 */
const SET_GAP = 20;

type HistoryRecordCarouselProps = {
  wishes: Wish[];
};

/**
 * Figma 2317:23377 / 2317:23180 — 日付バーは固定、カードは自由スクロール。
 * 濃色バー幅はカード枚数に応じて最後の白丸まで固定（スクロール非連動）。
 */
export function HistoryRecordCarousel({ wishes }: HistoryRecordCarouselProps) {
  const { s } = useDesignScale();
  const [scrollX, setScrollX] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const slides = useMemo(() => {
    let doneCount = 0;
    let excusedCount = 0;
    return wishes.map((wish) => {
      const slot =
        wish.status === "done" ? doneCount++ : excusedCount++;
      const theme = historyCardThemeForWish(wish, slot);
      const date = getWishAchievementDate(wish) ?? wish.createdAt;
      return { wish, theme, date };
    });
  }, [wishes]);

  const setWidth = s(HISTORY_CARD_WIDTH);
  const setGap = s(SET_GAP);
  const cardsRowWidth =
    slides.length * setWidth + Math.max(slides.length - 1, 0) * setGap;
  /** 末尾カードを左端に揃えるための右余白（1枚目と同じ見え方） */
  const endInset =
    viewportWidth > setWidth ? viewportWidth - setWidth : 0;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  if (slides.length === 0) return null;

  return (
    <View className="w-full" style={{ paddingHorizontal: s(20) }}>
      <View style={{ gap: s(SECTION_GAP) }}>
        <HistoryLinkedTimelineTrack
          dates={slides.map((slide) => slide.date)}
          cardWidth={HISTORY_CARD_WIDTH}
          cardGap={SET_GAP}
          scrollX={scrollX}
        />
        <RNScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingRight: endInset }}
          onLayout={(event) => {
            setViewportWidth(event.nativeEvent.layout.width);
          }}
          onScroll={handleScroll}
        >
          <View
            className="flex-row"
            style={{ width: cardsRowWidth, gap: setGap }}
          >
            {slides.map((slide) => (
              <HistoryPledgeCard
                key={slide.wish.id}
                wish={slide.wish}
                theme={slide.theme}
              />
            ))}
          </View>
        </RNScrollView>
      </View>
    </View>
  );
}
