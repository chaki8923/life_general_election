import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { CharacterWalk } from "@/features/achievements/character-walk";
import { HistoryEmptyState } from "@/features/achievements/history-empty-state";
import { useWishStore } from "@/stores/wishes";
import { ScrollView, View } from "@/tw";

/**
 * 過去の履歴タブ。
 * ヒーロー動画は常に表示。政策を一度も達成していないときは空状態を出す。
 */
export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const bottomPadding = useTabBarBottomPadding();
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);

  const hasCompletedPolicy = useMemo(
    () => wishes.some((wish) => wish.status === "done"),
    [wishes]
  );

  const showEmpty = hasHydrated && !hasCompletedPolicy;

  return (
    <View className="flex-1 bg-flow-bg" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <CharacterWalk />
        {showEmpty ? (
          <View className="min-h-[280px] flex-1 items-center justify-center py-6">
            <HistoryEmptyState />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
