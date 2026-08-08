import { useMemo, useState } from "react";
import { FlowHeader } from "@/components/ui/flow-header";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { CharacterWalk } from "@/features/achievements/character-walk";
import { MilestoneBar } from "@/features/achievements/milestone-bar";
import {
  getDefaultMilestoneIndex,
  getWishesForMilestone,
  MILESTONES,
} from "@/features/achievements/milestones";
import { PolicyRecordCard } from "@/features/achievements/policy-record-card";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Segment = "done" | "excused";

export default function AchievementsScreen() {
  const wishes = useWishStore((state) => state.wishes);
  const [segment, setSegment] = useState<Segment>("done");
  const bottomPadding = useTabBarBottomPadding();

  const doneWishes = useMemo(
    () => wishes.filter((wish) => wish.status === "done"),
    [wishes]
  );
  const excusedWishes = useMemo(
    () =>
      wishes
        .filter((wish) => wish.status === "excused")
        .sort((a, b) => (b.excusedAt ?? 0) - (a.excusedAt ?? 0)),
    [wishes]
  );

  const doneCount = doneWishes.length;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // 未選択のうちは現在地に追従させ、タップ後はその選択を尊重する
  const activeIndex = selectedIndex ?? getDefaultMilestoneIndex(doneCount);
  const selectedMilestone = MILESTONES[activeIndex];

  const milestoneWishes = useMemo(
    () => getWishesForMilestone(doneWishes, activeIndex),
    [doneWishes, activeIndex]
  );

  const shownWishes = segment === "done" ? milestoneWishes : excusedWishes;

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="実績" hideBack />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <CharacterWalk />

        <View className="mt-6">
          <MilestoneBar
            doneCount={doneCount}
            selectedIndex={activeIndex}
            onSelect={setSelectedIndex}
          />
        </View>

        <View className="mt-2 px-5">
          <Text className="text-center text-xs text-[#737373]">
            達成した政策 {doneCount}件 ／ 達成ポイントをタップすると、その時の政策が見られます
          </Text>
        </View>

        <View className="mt-6 px-5">
          <View className="flex-row rounded-full bg-[#e5e5e5] p-1">
            <Pressable
              onPress={() => setSegment("done")}
              className={`h-10 flex-1 items-center justify-center rounded-full ${
                segment === "done" ? "bg-flow-gray" : ""
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  segment === "done" ? "text-white" : "text-[#737373]"
                }`}
              >
                できた({doneCount})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSegment("excused")}
              className={`h-10 flex-1 items-center justify-center rounded-full ${
                segment === "excused" ? "bg-flow-gray" : ""
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  segment === "excused" ? "text-white" : "text-[#737373]"
                }`}
              >
                できなかった({excusedWishes.length})
              </Text>
            </Pressable>
          </View>

          <Text className="mt-4 text-center text-sm font-bold text-flow-ink">
            {segment === "done"
              ? `${selectedMilestone.title}（${selectedMilestone.requiredCount}件）で実行した政策`
              : "できなかった政策"}
          </Text>
          {segment === "excused" ? (
            <Text className="mt-1 text-center text-xs text-[#999999]">
              達成ポイントには含まれないため、すべて表示しています
            </Text>
          ) : null}

          {shownWishes.length === 0 ? (
            <View className="mt-4 items-center rounded-2xl bg-white px-6 py-10">
              <Text className="text-center text-sm text-[#737373]">
                {segment === "done"
                  ? "この達成ポイントで実行した政策はまだありません"
                  : "できなかった政策はありません"}
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-3">
              {shownWishes.map((wish) => (
                <PolicyRecordCard key={wish.id} wish={wish} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
