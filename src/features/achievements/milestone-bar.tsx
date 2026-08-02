import { useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { getMilestoneFillRatio, MILESTONES } from "./milestones";
import { Pressable, Text, View } from "@/tw";

const COLUMN_WIDTH = 84;
const DOT_SIZE = 18;
const TRACK_HEIGHT = 6;
const TRACK_WIDTH = (MILESTONES.length - 1) * COLUMN_WIDTH;

type MilestoneBarProps = {
  doneCount: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * 達成ポイント付きプログレスバー。
 * ポイントは選挙ポスターのレベル閾値（0/1/3/5/10/20/30件）と同じ。
 */
export function MilestoneBar({
  doneCount,
  selectedIndex,
  onSelect,
}: MilestoneBarProps) {
  const scrollRef = useRef<ScrollView>(null);
  const fillRatio = getMilestoneFillRatio(doneCount);

  useEffect(() => {
    // 現在地が画面外にならないよう寄せる
    const target = Math.max(0, fillRatio * TRACK_WIDTH - COLUMN_WIDTH);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: target, animated: false });
    });
  }, [fillRatio]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      <View style={{ width: MILESTONES.length * COLUMN_WIDTH }}>
        {/* トラック（最初と最後のドット中心をつなぐ） */}
        <View
          className="absolute overflow-hidden rounded-full bg-[#e5e5e5]"
          style={{
            left: COLUMN_WIDTH / 2,
            top: (DOT_SIZE - TRACK_HEIGHT) / 2,
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
          }}
        >
          <View
            className="h-full rounded-full bg-tab-active"
            style={{ width: TRACK_WIDTH * fillRatio }}
          />
        </View>

        <View className="flex-row">
          {MILESTONES.map((milestone, index) => {
            const reached = doneCount >= milestone.requiredCount;
            const selected = index === selectedIndex;
            return (
              <Pressable
                key={milestone.level}
                onPress={() => onSelect(index)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${milestone.title} ${milestone.requiredCount}件`}
                style={{ width: COLUMN_WIDTH }}
                className="items-center"
              >
                <View
                  className={`items-center justify-center rounded-full ${
                    reached ? "bg-tab-active" : "bg-[#e5e5e5]"
                  } ${selected ? "border-2 border-flow-gray" : ""}`}
                  style={{ width: DOT_SIZE, height: DOT_SIZE }}
                />
                <Text
                  className={`mt-2 text-xs font-bold ${
                    reached ? "text-flow-ink" : "text-[#b0b0b0]"
                  }`}
                >
                  {milestone.requiredCount}件
                </Text>
                <Text
                  className={`mt-0.5 text-[11px] ${
                    selected ? "font-bold text-flow-ink" : "text-[#999999]"
                  }`}
                >
                  {milestone.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
