import { useDesignScale } from "@/features/election/layout";
import { ResultPagedRow } from "@/features/election/result-paged-row";
import { Pressable, Text, View } from "@/tw";
import { Image } from "@/tw/image";

const tipCharacterExplain = require("../../../assets/election/result/tip-character-explain.png");
const tipCharacterShadow = require("../../../assets/election/result/tip-character-shadow.png");
const tipChevron = require("../../../assets/election/result/tip-chevron.svg");

/** スワイプ中にカード同士がくっつかないようページ間のすき間（デザインpx） */
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
  const { s } = useDesignScale();
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
        style={{ width: s(7), height: s(12) }}
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
  const { s } = useDesignScale();
  return (
    <View
      className="relative w-full justify-center overflow-hidden rounded-xl border border-[#f6f6f6] bg-white"
      style={{ minHeight: s(96) }}
    >
      <Image
        pointerEvents="none"
        source={tipCharacterShadow}
        className="absolute"
        style={{
          left: s(27),
          bottom: s(13),
          width: s(40),
          height: s(11),
        }}
        contentFit="fill"
      />

      <Image
        pointerEvents="none"
        source={tipCharacterExplain}
        className="absolute"
        style={{
          left: s(12),
          top: s(10),
          width: s(64),
          height: s(72),
        }}
        contentFit="contain"
        accessibilityLabel="説明キャラクター"
      />

      <View
        className="min-w-0 flex-row items-end"
        style={{
          marginLeft: s(84),
          gap: s(6),
          paddingVertical: s(14),
          paddingRight: s(12),
        }}
      >
        <View className="min-w-0 flex-1" style={{ gap: s(6) }}>
          <View
            className="self-start bg-flow-ink"
            style={{
              borderRadius: s(10),
              paddingHorizontal: s(10),
              paddingVertical: s(2),
            }}
          >
            <Text
              className="font-flow-medium text-white"
              style={{ fontSize: s(11), lineHeight: s(11 * 1.4) }}
              numberOfLines={1}
            >
              {slide.badge}
            </Text>
          </View>

          {slide.kind === "explain" ? (
            <Text
              className="font-flow-medium text-flow-ink-mid"
              style={{ fontSize: s(13), lineHeight: s(13 * 1.4) }}
            >
              <Text
                className="font-flow-medium text-flow-ink"
                style={{ fontSize: s(13) }}
              >
                公約
              </Text>
              は大きな目標、
              <Text
                className="font-flow-medium text-flow-ink"
                style={{ fontSize: s(13) }}
              >
                政策
              </Text>
              はゴールに辿り着くための小さな目標のことだよ！
            </Text>
          ) : (
            <Text
              className="font-flow-medium text-flow-ink-mid"
              style={{ fontSize: s(13), lineHeight: s(13 * 1.4) }}
              numberOfLines={4}
            >
              <Text
                className="font-flow text-flow-ink"
                style={{ fontSize: s(13), lineHeight: s(13 * 1.4) }}
              >
                {slide.recommendTitle}
              </Text>
              {"\n"}
              {slide.recommendSuffix}
            </Text>
          )}
        </View>

        <View
          className="shrink-0 items-end justify-between"
          style={{ height: s(58), width: s(35), paddingBottom: s(2) }}
        >
          <View
            className="rounded-full bg-[#f6f6f6]"
            style={{ paddingHorizontal: s(10) }}
          >
            <Text
              className="font-flow-medium text-flow-ink"
              style={{ fontSize: s(10), lineHeight: s(10 * 1.4) }}
            >
              {pageLabel}
            </Text>
          </View>
          {slide.kind === "explain" ? (
            <TipChevron onPress={onNext} />
          ) : (
            <View style={{ height: s(12), width: s(7) }} />
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * 開票結果の Tips カード（Figma 704:9787 / 1691:2830）
 * 横スワイプで 1/2 → 2/2。白カード + ダークバッジ。
 */
export function ResultTipCard({ recommendLabel }: ResultTipCardProps) {
  const { s } = useDesignScale();
  const slideGap = s(SLIDE_GAP);

  const slides: TipSlide[] = [
    SLIDES[0],
    {
      ...SLIDES[1],
      recommendTitle: recommendLabel
        ? `「${recommendLabel}」`
        : SLIDES[1].recommendTitle,
    },
  ];

  return (
    <ResultPagedRow
      pageCount={slides.length}
      gap={slideGap}
      placeholderHeight={s(96)}
      renderPage={(index, { goToPage }) => (
        <TipCardBody
          slide={slides[index]}
          pageLabel={`${index + 1}/${slides.length}`}
          onNext={() => goToPage(index + 1)}
        />
      )}
    />
  );
}
