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

const excuseImage = require("../../../assets/poster/excuse-character.webp");

/** Figma 2780:25977 */
const IMAGE_WIDTH = 180;
const IMAGE_HEIGHT = 225;
/** Figma 2780:25972 の下向き三角。55角の枠に対して実寸はこの大きさ */
const TAIL_WIDTH = 42;
const TAIL_HEIGHT = 19;

/**
 * 言い訳の完了画面（Figma 2780:25811）。
 * 理由選択画面が markExcused 済みなので、ここは保存された言い訳を見せるだけ。
 */
export default function WishExcuseCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const wish = useWishStore((state) =>
    state.wishes.find((item) => item.id === id)
  );
  const excuse = wish?.excuse;
  // 画面に入った時点で次の開票を先読みしておき、演出を挟まずに結果へ飛べるようにする
  const { loading, handleNext } = useNextPolicy(wish);
  const bottomPadding = useTabBarBottomPadding();

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="完了！" />

      <View
        className="flex-1 items-center justify-center gap-[32px] pt-[34px]"
        style={{ paddingBottom: bottomPadding }}
      >
        {/* Figma 2780:25906。吹き出しカード */}
        <View
          className="w-[350px] items-center gap-[12px] rounded-[16px] bg-white px-[20px] pb-[32px] pt-[24px]"
          style={{ boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" }}
        >
          <Text className="w-full text-center font-flow text-[12px] text-flow-blue">
            今回の言い訳が生成されました！
          </Text>
          <Text className="w-full text-center font-flow text-[18px] leading-[28px] tracking-[0.9px] text-flow-ink">
            {excuse ?? "言い訳が見つかりませんでした"}
          </Text>

          {/* しっぽ。左右のボーダーを透明にして下向きの三角をつくる（SVG非依存） */}
          <View
            style={{
              position: "absolute",
              bottom: -TAIL_HEIGHT,
              // 絶対配置の子は親の items-center に従わない実装もあるので、自前で中央へ寄せる
              left: "50%",
              marginLeft: -TAIL_WIDTH / 2,
              width: 0,
              height: 0,
              borderLeftWidth: TAIL_WIDTH / 2,
              borderRightWidth: TAIL_WIDTH / 2,
              borderTopWidth: TAIL_HEIGHT,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: "#ffffff",
              borderBottomWidth: 0,
            }}
          />
        </View>

        <Image
          source={excuseImage}
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            borderRadius: 4,
          }}
          contentFit="cover"
        />

        <View className="w-full px-[20px]">
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
        onPress={(tab) => {
          if (tab === "index") router.replace("/");
          else if (tab === "vote") router.replace("/(tabs)/vote");
          else router.replace("/(tabs)/achievements");
        }}
      />
    </View>
  );
}
