import { FlowButton } from "@/components/ui/flow-button";
import { INTEREST_IMAGES } from "@/constants/interests";
import { DevResetButton } from "@/features/dev/dev-reset-button";
import { TopBackground } from "@/features/election/top-background";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";

const logo = require("../../../assets/election/logo-topyokko.webp");

type ElectionStartScreenProps = {
  bottomPadding: number;
  onStart: () => void;
};

/**
 * walk_baby.mp4を背景にした総選挙の開始画面。
 * 登録前オンボーディングと、登録後の「選挙する」タブで共用する。
 */
export function ElectionStartScreen({
  bottomPadding,
  onStart,
}: ElectionStartScreenProps) {
  // 登録前はプロフィール入力中、登録後はこの画面を見ている間に次画面の画像を読む
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
          <FlowButton label="始める" onPress={onStart} className="w-full" />
          <DevResetButton className="mt-4 items-center" />
        </View>
      </View>

      {/* Figmaの「年代別ランキングを見る」は fetchThemeRanking() が
          年代別集計に未対応のため、実装できるまで非表示 */}
    </View>
  );
}
