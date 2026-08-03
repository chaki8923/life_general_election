import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";
import type { Candidate } from "@/types";
import { ResultCardBody } from "./ranked-result-card";
import { MINORITY_THEME } from "./result-theme";

const crowdImage = require("../../../assets/poster/character-crowd.png");

type MinorityCarouselProps = {
  candidates: Candidate[];
  onProceed: (candidate: Candidate) => void;
};

export function MinorityCarousel({
  candidates,
  onProceed,
}: MinorityCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const cardWidth = width - 48;
  const gap = 12;

  if (candidates.length === 0) return null;

  return (
    <View className="mt-8">
      <Text className="text-center font-flow text-base text-flow-ink">
        そのほかにもユニークな声が{"\n"}集まったよ！
      </Text>

      <Image
        source={crowdImage}
        className="mt-3 self-center"
        style={{ width: 120, height: 48 }}
        contentFit="contain"
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + gap}
        decelerationRate="fast"
        contentContainerClassName="px-5 pt-4"
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + gap)))
        }
      >
        {candidates.map((candidate) => (
          <View
            key={candidate.id}
            style={{ width: cardWidth, marginRight: gap }}
          >
            <ResultCardBody
              theme={MINORITY_THEME}
              candidate={candidate}
              onProceed={() => onProceed(candidate)}
              compact
            />
          </View>
        ))}
      </ScrollView>

      {candidates.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {candidates.map((c, i) => (
            <View
              key={c.id}
              className={`h-1.5 rounded-full ${
                i === page ? "w-3 bg-flow-green" : "w-1.5 bg-flow-ink-low/40"
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
