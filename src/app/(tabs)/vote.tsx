import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { resetAppData } from "@/features/dev/reset-app-data";
import { TopBackground } from "@/features/election/top-background";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";

const logo = require("../../../assets/election/logo-1000nin.png");

/** 総選挙トップ（Figma: TOP 1664-6457） */
export default function VoteScreen() {
  const router = useRouter();
  const bottomPadding = useTabBarBottomPadding();

  return (
    <View className="flex-1 bg-white">
      <TopBackground />

      <View
        className="flex-1 items-center justify-center gap-[104px]"
        style={{ paddingBottom: bottomPadding }}
      >
        {/* Figma: 324pxの半透明白丸に、ロゴと説明文を載せる */}
        <View className="h-[324px] w-[324px] items-center justify-center gap-4 rounded-full bg-white/[0.62] p-12">
          <View className="w-full items-center gap-4">
            {/* 正式ロゴができたらこのファイルを差し替える */}
            <Image
              source={logo}
              style={{ width: 196, height: 99.486 }}
              contentFit="contain"
            />
            <Text className="text-center font-flow text-[12px] leading-5 tracking-[0.6px] text-black">
              {"あなたの人生に、\nちょっとおせっかい。\n将来の漠然とした悩みを、\n具体的な一歩に変えるアプリです。"}
            </Text>
          </View>
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

      {__DEV__ && (
        <Pressable
          onPress={() => {
            resetAppData().catch((e) => console.warn("[dev reset]", e));
          }}
          className="absolute inset-x-0 top-0 items-center pt-16"
          hitSlop={12}
        >
          <Text className="text-xs text-election-ink/40">
            🧹 [DEV] データをリセットして最初から
          </Text>
        </Pressable>
      )}
    </View>
  );
}
