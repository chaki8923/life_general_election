import { useRouter } from "expo-router";
import { Pressable, Text } from "@/tw";
import { resetAppData } from "./reset-app-data";

type DevResetButtonProps = {
  className?: string;
};

/** 開発ビルドでのみ表示する、プロフィール登録確認用のリセットボタン。 */
export function DevResetButton({ className = "" }: DevResetButtonProps) {
  const router = useRouter();

  if (!__DEV__) return null;

  const handlePress = () => {
    resetAppData()
      .then(() => router.replace("/onboarding"))
      .catch((e) => console.warn("[dev reset]", e));
  };

  return (
    <Pressable onPress={handlePress} hitSlop={12} className={className}>
      <Text className="font-flow-medium text-[11px] text-flow-ink-low">
        🧹 [DEV] プロフィール登録をリセット
      </Text>
    </Pressable>
  );
}
