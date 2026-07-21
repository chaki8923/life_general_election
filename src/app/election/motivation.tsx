import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StepDots } from "@/components/ui/step-dots";
import { ELECTION_MOTIVATIONS } from "@/constants/election-motivations";
import { useElectionStore } from "@/stores/election";

export default function MotivationSelectScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const setMotivation = useElectionStore((s) => s.setMotivation);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = ELECTION_MOTIVATIONS.find((m) => m.id === selectedId);

  // 直リンク等で上流状態がない場合は興味関心の選択からやり直し
  if (!worry) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-base text-election-ink">
          悩みが選ばれていません
        </Text>
        <Pressable
          onPress={() => router.replace("/election")}
          className="mt-4 rounded-full bg-election-red px-6 py-3"
        >
          <Text className="font-bold text-white">興味・関心を選ぶ</Text>
        </Pressable>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!selected) return;
    // electionがリセットされ、result画面で開票が再生成される
    setMotivation(selected.label);
    router.push("/election/result");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-44 pt-14">
        <Text className="text-center text-xl text-election-ink">
          今のあなたの{"\n"}モチベーションを教えてください
        </Text>

        <View className="mt-8 gap-8">
          {ELECTION_MOTIVATIONS.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <Pressable
                key={m.id}
                onPress={() => setSelectedId(m.id)}
                className={`h-32 items-center gap-2 rounded-xl border-2 bg-white px-4 py-5 shadow-md shadow-black/25 ${
                  isSelected ? "border-election-red" : "border-transparent"
                }`}
              >
                <Text className="text-base text-election-ink">{m.label}</Text>
                <Image
                  source={m.icon}
                  style={{ width: 48, height: 44 }}
                  contentFit="contain"
                />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-9">
          <StepDots total={3} current={2} />
        </View>
      </ScrollView>

      <PrimaryButton
        label="🗳️ 総選挙を開催する"
        disabled={!selected}
        onPress={handleSubmit}
      />
    </View>
  );
}
