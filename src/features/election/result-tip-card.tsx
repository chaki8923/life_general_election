import { Pressable, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView as RNScrollView } from "react-native";

const tipCharacterExplain = require("../../../assets/election/result/tip-character-explain.png");
const tipChevron = require("../../../assets/election/result/tip-chevron.svg");

/** スワイプ中にカード同士がくっつかないようページ間のすき間 */
const SLIDE_GAP = 24;

type TipSlide = {
  badge: string;
  /** 1枚目: 説明文。2枚目: 太字見出し + 続き */
  kind: "explain" | "recommend";
  recommendTitle?: string;
  recommendSuffix?: string;
};

const SLIDES: TipSlide[] = [
  {
    kind: "explain",
    badge: "公約、政策とは？",
  },
  {
    kind: "recommend",
    badge: "おすすめは？",
    recommendTitle: "「家計簿をつける」",
    recommendSuffix: "から始めるのがオススメだよ！",
  },
];

type ResultTipCardProps = {
  /** 2枚目のおすすめ公約。未指定時は Figma 文言 */
  recommendLabel?: string;
};

function TipChevron({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="次のヒント"
      className="items-center justify-center"
    >
      <Image
        source={tipChevron}
        style={{ width: 7, height: 12 }}
        contentFit="contain"
      />
    </Pressable>
  );
}

function TipCardBody({
  slide,
  pageLabel,
  onNext,
}: {
  slide: TipSlide;
  pageLabel: string;
  onNext: () => void;
}) {
  return (
    <View className="relative h-[82px] justify-center rounded-lg bg-[#f6f6f6]">
      {/* Figma 1895:13877 — 表示58×66、ソース422×467（Retina向け） */}
      <Image
        pointerEvents="none"
        source={tipCharacterExplain}
        className="absolute left-3 top-2"
        style={{ width: 58, height: 66 }}
        contentFit="cover"
        contentPosition="top center"
        accessibilityLabel="説明キャラクター"
      />
      {/* Figma 1691:2843 — Ellipse 10 */}
      <View
        pointerEvents="none"
        className="absolute left-[26px] top-[65px] h-2.5 w-9 rounded-full bg-black/10"
      />

      <View className="ml-[87px] flex-row items-end gap-1.5 py-3 pr-3">
        <View className="min-w-0 flex-1 gap-1">
          <View className="self-start rounded-[10px] bg-flow-ink px-2.5">
            <Text className="font-flow-medium text-[10px] leading-[1.4] text-white">
              {slide.badge}
            </Text>
          </View>

          {slide.kind === "explain" ? (
            <Text className="font-flow-medium text-xs leading-[1.4] text-flow-ink-mid">
              <Text className="font-flow-medium text-xs text-flow-ink">
                公約
              </Text>
              は大きな目標、
              <Text className="font-flow-medium text-xs text-flow-ink">
                政策
              </Text>
              はゴールに辿り着くための小さな目標のことだよ！
            </Text>
          ) : (
            <Text className="font-flow-medium text-xs leading-[1.4] text-flow-ink-mid">
              <Text className="font-flow text-xs leading-[1.4] text-flow-ink">
                {slide.recommendTitle}
              </Text>
              {"\n"}
              {slide.recommendSuffix}
            </Text>
          )}
        </View>

        <View className="h-[52px] w-[35px] items-end justify-between pb-0.5">
          <View className="rounded-full bg-white px-2.5">
            <Text className="font-flow-medium text-[10px] leading-[1.4] text-flow-ink">
              {pageLabel}
            </Text>
          </View>
          {slide.kind === "explain" ? (
            <TipChevron onPress={onNext} />
          ) : (
            <View className="h-3 w-[7px]" />
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * 開票結果の Tips カード（Figma 704:9787 / 1691:2830）
 * 横スワイプで 1/2 → 2/2。1枚目は gray/50 カード + ダークバッジ。
 */
export function ResultTipCard({ recommendLabel }: ResultTipCardProps) {
  const scrollRef = useRef<RNScrollView>(null);
  const [page, setPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const slides: TipSlide[] = [
    SLIDES[0],
    {
      ...SLIDES[1],
      recommendTitle: recommendLabel
        ? `「${recommendLabel}」`
        : SLIDES[1].recommendTitle,
    },
  ];

  const slideStride = pageWidth + SLIDE_GAP;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    setPage(Math.round(e.nativeEvent.contentOffset.x / slideStride));
  };

  const goNext = () => {
    if (pageWidth <= 0 || page >= slides.length - 1) return;
    const next = page + 1;
    scrollRef.current?.scrollTo({ x: slideStride * next, animated: true });
    setPage(next);
  };

  return (
    <View
      className="overflow-hidden"
      onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
    >
      {pageWidth > 0 ? (
        <RNScrollView
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          decelerationRate="fast"
          snapToInterval={slideStride}
          snapToAlignment="start"
          disableIntervalMomentum
        >
          {slides.map((slide, index) => (
            <View
              key={slide.badge}
              style={{
                width: pageWidth,
                marginRight: index < slides.length - 1 ? SLIDE_GAP : 0,
              }}
            >
              <TipCardBody
                slide={slide}
                pageLabel={`${index + 1}/${slides.length}`}
                onNext={goNext}
              />
            </View>
          ))}
        </RNScrollView>
      ) : (
        <View className="h-[82px]" />
      )}
    </View>
  );
}
