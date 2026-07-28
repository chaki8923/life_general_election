import { useState } from "react";
import { useRouter } from "expo-router";
import { WishResultCard } from "@/features/wishes/wish-result-card";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";

type Segment = "done" | "excused";

export default function AchievementsScreen() {
  const router = useRouter();
  const wishes = useWishStore((state) => state.wishes);
  const [segment, setSegment] = useState<Segment>("done");

  const doneWishes = wishes
    .filter((wish) => wish.status === "done")
    .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
  const excusedWishes = wishes
    .filter((wish) => wish.status === "excused")
    .sort((a, b) => (b.excusedAt ?? 0) - (a.excusedAt ?? 0));
  const shownWishes = segment === "done" ? doneWishes : excusedWishes;

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      <ScrollView contentContainerClassName="px-5 pb-16 pt-16">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="pr-4 py-2">
            <Text className="text-base font-bold text-[#555555]">戻る</Text>
          </Pressable>
          <Text className="text-xl font-bold text-[#333333]">公約の実績</Text>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-6 rounded-2xl bg-white px-6 py-5">
          <View className="items-center">
            <View className="rounded-full bg-election-red px-3 py-1">
              <Text className="text-xs font-bold text-white">達成</Text>
            </View>
            <Text className="mt-2 text-2xl font-bold text-[#333333]">
              {doneWishes.length}
              <Text className="text-sm font-bold text-[#737373]">件</Text>
            </Text>
          </View>
          <View className="h-12 w-px bg-[#e5e5e5]" />
          <View className="items-center">
            <View className="rounded-full bg-[#999999] px-3 py-1">
              <Text className="text-xs font-bold text-white">未達成</Text>
            </View>
            <Text className="mt-2 text-2xl font-bold text-[#333333]">
              {excusedWishes.length}
              <Text className="text-sm font-bold text-[#737373]">件</Text>
            </Text>
          </View>
        </View>

        <View className="mt-6 flex-row rounded-full bg-[#e5e5e5] p-1">
          <Pressable
            onPress={() => setSegment("done")}
            className={`h-10 flex-1 items-center justify-center rounded-full ${
              segment === "done" ? "bg-[#555555]" : ""
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                segment === "done" ? "text-white" : "text-[#737373]"
              }`}
            >
              できた({doneWishes.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSegment("excused")}
            className={`h-10 flex-1 items-center justify-center rounded-full ${
              segment === "excused" ? "bg-[#555555]" : ""
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

        {shownWishes.length === 0 ? (
          <View className="mt-10 items-center rounded-2xl bg-white px-6 py-10">
            <Text className="text-sm text-[#737373]">
              {segment === "done"
                ? "達成した公約はまだありません"
                : "できなかった公約はありません"}
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {shownWishes.map((wish) => (
              <WishResultCard key={wish.id} wish={wish} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
