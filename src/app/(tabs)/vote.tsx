import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { resetAppData } from "@/features/dev/reset-app-data";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";

const crowdImage = require("../../../assets/election/top-crowd.png");

/** 総選挙トップ（Figma: TOP_総選挙 494-11703） */
export default function VoteScreen() {
  const router = useRouter();
  const bottomPadding = useTabBarBottomPadding();

  return (
    <View className="flex-1 bg-white">
      <FlowHeader title="1000人 人生総選挙" hideBack />

      <View
        className="flex-1 items-center justify-center px-4"
        style={{ paddingBottom: bottomPadding }}
      >
        <Image
          source={crowdImage}
          style={{ width: 275, height: 142 }}
          contentFit="contain"
        />

        {/* 2回目以降もこのボタンから興味関心を聞くページに進む */}
        <FlowButton
          label="総選挙をはじめる"
          variant="gray"
          onPress={() => router.push("/election")}
          className="mt-8 w-[358px] max-w-full"
        />

        {/* Figmaの「年代別ランキングを見る」は fetchThemeRanking() が
            年代別集計に未対応のため、実装できるまで非表示 */}

        {__DEV__ && (
          <Pressable
            onPress={() => {
              resetAppData().catch((e) => console.warn("[dev reset]", e));
            }}
            className="mt-10"
            hitSlop={12}
          >
            <Text className="text-xs text-election-ink/40">
              🧹 [DEV] データをリセットして最初から
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
