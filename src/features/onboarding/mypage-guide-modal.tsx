import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView as RNScrollView } from "react-native";
import { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlowButton } from "@/components/ui/flow-button";
import { ProgressDots } from "@/components/ui/progress-dots";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";

const reportImage = require("../../../assets/poster/guide-report.png");
const posterImage = require("../../../assets/poster/guide-poster.png");

/** Figma 2665:19118 の btn は gray/900。FlowButton 既定の #32383f とは別 */
const BUTTON_FILL = "#24292f";
/** シート左右の余白（Figma 2665:19111 padding 24） */
const SHEET_PADDING = 24;

type GuidePage = {
  title: string;
  body: string;
  image: number;
  imageWidth: number;
  imageHeight: number;
  /** Figma の letterSpacing。指定がないページは 0 */
  tracking?: number;
};

/** Figma 2665:19111 / 2665:19036 */
const PAGES: GuidePage[] = [
  {
    title: "進捗を報告しよう",
    body: "設定した期日内に政策を「できた」か「できなかった」かを報告しよう。\nあなたが公約を達成できるまで何度でもサポートします！",
    image: reportImage,
    imageWidth: 247,
    imageHeight: 179,
  },
  {
    title: "選挙ポスターを作成しよう！",
    body: "アバター生成で個性豊かなとぴょっこが登場！写真を登録して、あなたらしいポスターにもできる！待ち受けにするもよし、目標を忘れないよう活用しよう。",
    image: posterImage,
    imageWidth: 160,
    imageHeight: 182,
    tracking: -0.28,
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * マイページのガイド（Figma 2665:19111「初回ガイド」）。
 * 下から出るシートに2ページを横スワイプで並べ、最後のページの「次へ」で閉じる。
 */
export function MypageGuideModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<RNScrollView>(null);
  const [page, setPage] = useState(0);
  // ページ幅は端末幅からシートのパディングを引いた実測値で決める
  const [pageWidth, setPageWidth] = useState(0);

  // 毎回表示するので、開くたびに先頭のページへ戻す
  useEffect(() => {
    if (!visible) return;
    setPage(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [visible]);

  const handleNext = () => {
    if (page >= PAGES.length - 1) {
      onClose();
      return;
    }
    scrollRef.current?.scrollTo({
      x: pageWidth * (page + 1),
      animated: true,
    });
    setPage(page + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="閉じる"
        className="flex-1 justify-end bg-black/50"
      >
        {/* シート内のタップで閉じないよう、ここでタッチを止める */}
        <Animated.View
          entering={SlideInDown.duration(280)}
          onStartShouldSetResponder={() => true}
          className="items-center gap-[12px] rounded-t-[24px] bg-white"
          style={{
            paddingTop: SHEET_PADDING,
            paddingHorizontal: SHEET_PADDING,
            paddingBottom: SHEET_PADDING + insets.bottom,
          }}
        >
          <View
            className="w-full"
            onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
          >
            <RNScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                if (pageWidth === 0) return;
                setPage(
                  Math.round(event.nativeEvent.contentOffset.x / pageWidth)
                );
              }}
            >
              {PAGES.map((item) => (
                <View
                  key={item.title}
                  // 実測幅は className で書けないため style で指定
                  style={{ width: pageWidth }}
                  className="items-center justify-center gap-[16px] rounded-[16px] bg-white px-[20px]"
                >
                  <Text className="w-full text-center font-flow text-[18px] text-flow-ink">
                    {item.title}
                  </Text>
                  <Image
                    source={item.image}
                    style={{ width: item.imageWidth, height: item.imageHeight }}
                    contentFit="contain"
                  />
                  <Text
                    className="w-full font-flow-regular text-[14px] leading-[21px] text-flow-ink-mid"
                    style={
                      item.tracking
                        ? { letterSpacing: item.tracking }
                        : undefined
                    }
                  >
                    {item.body}
                  </Text>
                </View>
              ))}
            </RNScrollView>
          </View>

          <ProgressDots total={PAGES.length} current={page} />

          <FlowButton
            label="次へ"
            fillColor={BUTTON_FILL}
            onPress={handleNext}
            className="h-[48px] w-full"
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
