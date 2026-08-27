import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterWalk } from "@/features/achievements/character-walk";
import { View } from "@/tw";

/** 過去の履歴タブ。現状はヒーロー動画のみ（下ナビは Tabs の AppTabBar） */
export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-flow-bg" style={{ paddingTop: insets.top }}>
      <CharacterWalk />
    </View>
  );
}
