import { useLocalSearchParams, useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import {
  FlowTabBarOverlay,
  useTabBarBottomPadding,
} from "@/components/ui/tab-bar";
import { useNextPolicy } from "@/features/election/use-next-policy";
import { useWishStore } from "@/stores/wishes";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";

const congratsImage = require("../../../assets/poster/congrats-character.webp");

/** Figma 2780:25801 img */
const IMAGE_SIZE = 275;

/**
 * 公約を達成したあとの完了画面（Figma 2780:24878 Screen-2-Congrats）。
 * 「できた！」→ 達成として記録する のあとに push される。
 */
export default function WishCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const wish = useWishStore((state) =>
    state.wishes.find((item) => item.id === id)
  );
  // 画面に入った時点で次の開票を先読みしておき、演出を挟まずに結果へ飛べるようにする
  const { loading, handleNext } = useNextPolicy(wish);
  const bottomPadding = useTabBarBottomPadding();

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="完了！" />

      <View className="flex-1" style={{ paddingBottom: bottomPadding }}>
        <View className="flex-1 items-center justify-center gap-[24px] px-[16px] py-[48px]">
          <View className="w-full items-center gap-[16px]">
            <Text className="w-full text-center font-flow text-[20px] leading-[32px] tracking-[1px] text-flow-ink">
              congratulations
            </Text>
            <Text className="w-full text-center font-flow-regular text-[16px] leading-[25.6px] text-flow-ink">
              早速やりきるなんてすばらしい！{"\n"}なんて素晴らしい実行力なんだ！
            </Text>
          </View>
          <Image
            source={congratsImage}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            contentFit="contain"
          />
        </View>

        <View className="px-[20px]">
          <FlowButton
            label="次の政策を決めよう！"
            className="h-[48px]"
            loading={loading}
            onPress={handleNext}
          />
        </View>
      </View>

      <FlowTabBarOverlay
        active="index"
        onPress={(id) => {
          if (id === "index") router.replace("/");
          else if (id === "vote") router.replace("/(tabs)/vote");
          else router.replace("/(tabs)/achievements");
        }}
      />
    </View>
  );
}
