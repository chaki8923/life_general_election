import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { INTEREST_IMAGES } from "@/constants/interests";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { DevResetButton } from "@/features/dev/dev-reset-button";
import { TopBackground } from "@/features/election/top-background";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";

const logo = require("../../../assets/election/logo-topyokko.webp");

/** 総選挙トップ（Figma: TOP 2070:7821） */
export default function VoteScreen() {
  const router = useRouter();
  const bottomPadding = useTabBarBottomPadding();

  // 「始める」の遷移先がお悩み選択。2回目以降の導線でも待たせない
  usePreloadImages(INTEREST_IMAGES);

  return (
    <View className="flex-1 bg-white">
      <TopBackground />

      <View
        className="flex-1 items-center justify-center gap-[104px]"
        style={{ paddingBottom: bottomPadding }}
      >
        {/* Figma: 324pxの半透明白丸に、ロゴとキャッチコピーを載せる */}
        <View className="h-[324px] w-[324px] items-center justify-center gap-[6px] rounded-full bg-white/[0.62]">
          <Image
            source={logo}
            style={{ width: 224, height: 113 }}
            contentFit="contain"
          />
          <Text className="text-center font-flow text-[14px] leading-[24px] text-flow-ink">
            あなたの人生に、ちょっとおせっかい。
          </Text>
        </View>

        <View className="w-full px-5">
          {/* 2回目以降もこのボタンから興味関心を聞くページに進む */}
          <FlowButton
            label="始める"
            onPress={() => router.push("/election")}
            className="w-full"
          />
        </View>
      </View>

      {/* Figmaの「年代別ランキングを見る」は fetchThemeRanking() が
          年代別集計に未対応のため、実装できるまで非表示 */}

      <DevResetButton className="absolute inset-x-0 top-0 items-center pt-16" />
    </View>
  );
}
