import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StepDots } from "@/components/ui/step-dots";
import { INTERESTS } from "@/constants/interests";
import { incrementThemeStat } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";

export default function InterestSelectScreen() {
  const router = useRouter();
  const setInterest = useElectionStore((s) => s.setInterest);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = INTERESTS.find((i) => i.id === selectedId);

  const handleSubmit = () => {
    if (!selected) return;
    // 悩みランキング集計は興味カテゴリの安定キーで行う（AI生成worryはidが毎回変わるため）
    incrementThemeStat(selected.id, selected.label, selected.label);
    // 下流（候補・悩み・モチベ・開票）がリセットされ、worries画面の生成が発火する
    setInterest(selected.label);
    router.push("/election/worries");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-2 pb-44 pt-14">
        <Text className="text-center text-xl text-election-ink">
          興味・関心のあることを{"\n"}教えてください
        </Text>

        <View className="mt-9 flex-row flex-wrap justify-center gap-x-6 gap-y-2">
          {INTERESTS.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                className={`h-28 w-40 items-center gap-3 rounded-xl border-2 bg-white px-4 py-5 shadow-md shadow-black/25 ${
                  isSelected ? "border-election-red" : "border-transparent"
                }`}
              >
                <Text className="text-base text-election-ink">
                  {item.label}
                </Text>
                <Image
                  source={item.icon}
                  style={{ width: 48, height: 40 }}
                  contentFit="contain"
                />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-10">
          <StepDots total={3} current={0} />
        </View>
      </ScrollView>

      <PrimaryButton label="次へ" disabled={!selected} onPress={handleSubmit} />
    </View>
  );
}
