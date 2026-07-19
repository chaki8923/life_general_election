import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Pressable, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import type { Candidate } from "@/types";

type CandidateCardProps = {
  candidate: Candidate;
  totalVotes: number;
  rank: number;
  selected: boolean;
  onSelect: () => void;
};

export function CandidateCard({
  candidate,
  totalVotes,
  rank,
  selected,
  onSelect,
}: CandidateCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(rank * 250, withTiming(1, { duration: 900 }));
  }, [progress, rank]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));
  const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;

  return (
    <View
      className={`rounded-xl border-2 bg-white p-4 shadow-sm ${
        selected ? "border-election-red" : "border-transparent"
      }`}
    >
      <View className="flex-row items-center gap-2">
        <View className="rounded-full bg-[#737373] px-3 py-1">
          <Text className="text-xs font-bold text-white">公約</Text>
        </View>
        {rank === 0 ? (
          <View className="rounded-full bg-[#ff2626] px-3 py-1">
            <Text className="text-xs font-bold text-white">当選確実</Text>
          </View>
        ) : candidate.isMinority ? (
          <View className="rounded-full bg-[#cccccc] px-3 py-1">
            <Text className="text-xs font-bold text-white">マイノリティ</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row items-start gap-3">
        <Text className="flex-1 text-sm font-bold text-[#333333]">
          {candidate.label}
        </Text>
        <Text className="text-sm font-bold text-[#333333]">
          {percentage.toFixed(1)}%
        </Text>
      </View>

      <View className="mt-3 h-4 overflow-hidden rounded-full bg-[#d9d9d9]">
        <Animated.View
          className="h-full rounded-full bg-[#333333]"
          style={[
            {
              width: `${Math.max(percentage, 2)}%`,
              transformOrigin: "left",
            },
            barStyle,
          ]}
        />
      </View>

      <View className="mt-4 rounded-lg bg-[#f8f8f8] p-3">
        <View className="self-start rounded-full bg-[#737373] px-3 py-1">
          <Text className="text-xs font-bold text-white">掲げる政策</Text>
        </View>
        <Text className="mt-2 text-xs leading-5 text-[#333333]">
          {candidate.action}
        </Text>
      </View>

      <Pressable
        onPress={onSelect}
        className={`mt-4 h-12 items-center justify-center rounded-full ${
          selected ? "bg-[#333333]" : "bg-[#737373]"
        }`}
      >
        <Text className="text-sm font-bold text-white">
          {selected ? "選択中" : "選択する"}
        </Text>
      </Pressable>
    </View>
  );
}
