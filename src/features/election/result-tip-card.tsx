import { useDesignScale } from "@/features/election/layout";
import { ResultPagedRow } from "@/features/election/result-paged-row";
import { Pressable, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { ReactNode } from "react";

const tipCharacterExplain = require("../../../assets/election/result/tip-character-explain.png");
const tipCharacterShadow = require("../../../assets/election/result/tip-character-shadow.png");
const tipChevron = require("../../../assets/election/result/tip-chevron.svg");

/** スワイプ中にカード同士がくっつかないようページ間のすき間（デザインpx） */
const SLIDE_GAP = 24;

/**
 * 1/2「公約、政策とは？」基準のレイアウト定数。
 * 1/2・2/2 共通。幅は親いっぱい、高さ・キャラ位置は固定で揃える。
 */
const TIP_CARD = {
  height: 84,
  paddingVertical: 10,
  paddingRight: 12,
  contentMarginLeft: 84,
  contentGap: 4,
  rowGap: 6,
  character: { left: 4, top: 10, width: 64, height: 64 },
  shadow: { left: 19, bottom: 6, width: 40, height: 11 },
  side: { width: 35, height: 50, paddingBottom: 2 },
  badge: {
    radius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 9,
  },
  bodyFontSize: 11,
  pageFontSize: 8,
} as const;

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

/**
 * Tips カード共通フレーム（1/2 基準）。
 * キャラ・影・高さ・余白は全ページ同一。中身だけ差し替える。
 */
function ResultTipCardFrame({
  pageLabel,
  trailing,
  children,
}: {
  pageLabel: string;
  trailing: ReactNode;
  children: ReactNode;
}) {
  const { s } = useDesignScale();
  const { character, shadow, badge, side } = TIP_CARD;

  return (
    <View
      className="relative w-full overflow-hidden rounded-xl border border-[#f6f6f6] bg-white"
      style={{ height: s(TIP_CARD.height) }}
    >
      <Image
        pointerEvents="none"
        source={tipCharacterShadow}
        className="absolute"
        style={{
          left: s(shadow.left),
          bottom: s(shadow.bottom),
          width: s(shadow.width),
          height: s(shadow.height),
        }}
        contentFit="fill"
      />

      <Image
        pointerEvents="none"
        source={tipCharacterExplain}
        className="absolute"
        style={{
          left: s(character.left),
          top: s(character.top),
          width: s(character.width),
          height: s(character.height),
        }}
        contentFit="contain"
        accessibilityLabel="説明キャラクター"
      />

      <View
        className="min-w-0 flex-1 flex-row items-center"
        style={{
          marginLeft: s(TIP_CARD.contentMarginLeft),
          gap: s(TIP_CARD.rowGap),
          paddingVertical: s(TIP_CARD.paddingVertical),
          paddingRight: s(TIP_CARD.paddingRight),
          height: s(TIP_CARD.height),
        }}
      >
        <View className="min-w-0 flex-1" style={{ gap: s(TIP_CARD.contentGap) }}>
          {children}
        </View>

        <View
          className="shrink-0 items-end justify-between"
          style={{
            height: s(side.height),
            width: s(side.width),
            paddingBottom: s(side.paddingBottom),
          }}
        >
          <View
            className="rounded-full bg-[#f6f6f6]"
            style={{ paddingHorizontal: s(badge.paddingHorizontal) }}
          >
            <Text
              className="font-flow-medium text-flow-ink"
              style={{
                fontSize: s(TIP_CARD.pageFontSize),
                lineHeight: s(TIP_CARD.pageFontSize * 1.4),
              }}
            >
              {pageLabel}
            </Text>
          </View>
          {trailing}
        </View>
      </View>
    </View>
  );
}

function TipBadge({ label }: { label: string }) {
  const { s } = useDesignScale();
  const { badge } = TIP_CARD;
  return (
    <View
      className="self-start bg-flow-ink"
      style={{
        borderRadius: s(badge.radius),
        paddingHorizontal: s(badge.paddingHorizontal),
        paddingVertical: s(badge.paddingVertical),
      }}
    >
      <Text
        className="font-flow-medium text-white"
        style={{
          fontSize: s(badge.fontSize),
          lineHeight: s(badge.fontSize * 1.4),
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function TipBodyText({ children }: { children: ReactNode }) {
  const { s } = useDesignScale();
  const size = TIP_CARD.bodyFontSize;
  return (
    <Text
      className="font-flow-medium text-flow-ink-mid"
      style={{ fontSize: s(size), lineHeight: s(size * 1.4) }}
      numberOfLines={3}
    >
      {children}
    </Text>
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
  const size = TIP_CARD.bodyFontSize;

  return (
    <ResultTipCardFrame
      pageLabel={pageLabel}
      trailing={
        slide.kind === "explain" ? (
          <TipChevron onPress={onNext} />
        ) : (
          <View style={{ height: s(12), width: s(7) }} />
        )
      }
    >
      <TipBadge label={slide.badge} />
      {slide.kind === "explain" ? (
        <TipBodyText>
          <Text
            className="font-flow-medium text-flow-ink"
            style={{ fontSize: s(size) }}
          >
            公約
          </Text>
          は大きな目標、
          <Text
            className="font-flow-medium text-flow-ink"
            style={{ fontSize: s(size) }}
          >
            政策
          </Text>
          はゴールに辿り着くための小さな目標のことだよ！
        </TipBodyText>
      ) : (
        <TipBodyText>
          <Text
            className="font-flow text-flow-ink"
            style={{ fontSize: s(size), lineHeight: s(size * 1.4) }}
          >
            {slide.recommendTitle}
          </Text>
          {"\n"}
          {slide.recommendSuffix}
        </TipBodyText>
      )}
    </ResultTipCardFrame>
  );
}

/**
 * 開票結果の Tips カード（Figma 704:9787 / 1691:2830）
 * 1/2 基準の共通フレームで 1/2↔2/2 を同じサイズ・キャラ配置に揃える。
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
      placeholderHeight={s(TIP_CARD.height)}
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
