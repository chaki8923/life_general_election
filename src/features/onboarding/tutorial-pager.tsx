import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlowButton } from "@/components/ui/flow-button";
import { ProgressDots } from "@/components/ui/progress-dots";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";
import { useProfileStore } from "@/stores/profile";
import { TUTORIAL_PAGES } from "./tutorial-pages";

/**
 * Figmaのイラスト枠 345x250。絵のアスペクト比はページごとに違うので、
 * 枠だけ固定して contain で中に収める
 */
const IMAGE_WIDTH = 345;
const IMAGE_ASPECT = 345 / 250;

/** 横スワイプ式のチュートリアル（Figma 981:3465）。完了でプロフィール登録へ進む */
export function TutorialPager() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const markTutorialSeen = useProfileStore((s) => s.markTutorialSeen);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  // 1ページ目を見ている間に、スワイプ先の3枚を読んでおく
  usePreloadImages(TUTORIAL_PAGES.slice(1).map((p) => p.image));

  const isLast = page === TUTORIAL_PAGES.length - 1;
  const imageWidth = Math.min(IMAGE_WIDTH, width - 32);
  const imageHeight = imageWidth / IMAGE_ASPECT;

  const handleNext = () => {
    if (isLast) {
      markTutorialSeen();
      router.replace("/onboarding/profile");
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  return (
    <View className="flex-1 bg-flow-bg" style={{ paddingTop: insets.top }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        style={{ flex: 1 }}
      >
        {TUTORIAL_PAGES.map((p) => (
          <View
            key={p.title}
            // 動的な画面幅はclassNameで書けないためstyleで指定
            style={{ width }}
            className="items-center px-4 pt-[39px]"
          >
            <Image
              source={p.image}
              style={{ width: imageWidth, height: imageHeight }}
              contentFit="contain"
            />
            <Text className="mt-6 text-center font-flow text-[20px] leading-[32px] text-flow-ink">
              {p.title}
            </Text>
            <Text className="mt-6 text-center font-flow-regular text-[14px] leading-[24px] text-flow-ink">
              {p.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        className="items-center px-5"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <ProgressDots
          total={TUTORIAL_PAGES.length}
          current={page}
          size={6}
          gap={8}
        />
        <FlowButton
          label={isLast ? "さあスタートだ！" : "次へ"}
          onPress={handleNext}
          className="mt-6 w-full"
        />
      </View>
    </View>
  );
}
