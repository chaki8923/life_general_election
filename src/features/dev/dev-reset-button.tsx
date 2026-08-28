import { useRouter } from "expo-router";
import { Pressable, Text } from "@/tw";
import { resetAppData } from "./reset-app-data";

type DevResetButtonProps = {
  /** 配置は呼び出し側に任せる（画面ごとに置き場所が違うため） */
  className?: string;
};

/**
 * 開発用: オンボーディングを最初からやり直すためのリセット。
 * 本番ビルドでは何も描かない。
 */
export function DevResetButton({ className = "" }: DevResetButtonProps) {
  const router = useRouter();

  if (!__DEV__) return null;

  const handlePress = () => {
    resetAppData()
      // 登録前の画面から押した場合はStack.Protectedのガードが反転しないので、
      // チュートリアル先頭（tutorialSeenを見るindex）へ自分で戻す
      .then(() => router.replace("/onboarding"))
      .catch((e) => console.warn("[dev reset]", e));
  };

  return (
    <Pressable onPress={handlePress} hitSlop={12} className={className}>
      <Text className="font-flow-medium text-[11px] text-flow-ink-low">
        🧹 [DEV] データをリセット
      </Text>
    </Pressable>
  );
}
