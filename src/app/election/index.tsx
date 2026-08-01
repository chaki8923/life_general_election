import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { Image } from "@/tw/image";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StepDots } from "@/components/ui/step-dots";
import { INTERESTS } from "@/constants/interests";
import { incrementThemeStat } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";

const OTHER_INTEREST_ID = "other";
const CUSTOM_INTEREST_MAX_LENGTH = 40;

export default function InterestSelectScreen() {
  const router = useRouter();
  const setInterest = useElectionStore((s) => s.setInterest);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customInterest, setCustomInterest] = useState("");

  const selected = INTERESTS.find((i) => i.id === selectedId);
  const isOtherSelected = selected?.id === OTHER_INTEREST_ID;
  const normalizedCustomInterest = customInterest.trim();
  const resolvedInterest = isOtherSelected
    ? normalizedCustomInterest
    : selected?.label;
  const canSubmit = Boolean(resolvedInterest);

  const handleSubmit = () => {
    if (!selected || !resolvedInterest) return;
    // 悩みランキング集計は興味カテゴリの安定キーで行う（AI生成worryはidが毎回変わるため）
    incrementThemeStat(selected.id, selected.label, selected.label);
    // 下流（候補・悩み・モチベ・開票）がリセットされ、worries画面の生成が発火する
    // 「その他」は自由入力を興味関心として渡し、その内容をAIの生成条件にする
    setInterest(resolvedInterest);
    router.push("/election/worries");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-2 pb-44 pt-14"
      >
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

        {isOtherSelected ? (
          <View className="mx-4 mt-6 gap-2">
            <Text className="text-sm font-bold text-election-ink/70">
              興味・関心を自由に入力してください
            </Text>
            <TextInput
              value={customInterest}
              onChangeText={setCustomInterest}
              placeholder="例：子育て、地域活動、ペット"
              placeholderTextColor="#2b2b2b66"
              autoFocus
              returnKeyType="done"
              maxLength={CUSTOM_INTEREST_MAX_LENGTH}
              onSubmitEditing={handleSubmit}
              className="rounded-2xl border-2 border-election-red bg-election-paper px-4 py-3 text-base text-election-ink"
              accessibilityLabel="その他の興味・関心"
            />
            <Text className="text-right text-xs text-election-ink/45">
              {customInterest.length}/{CUSTOM_INTEREST_MAX_LENGTH}
            </Text>
          </View>
        ) : null}

        <View className="mt-10">
          <StepDots total={3} current={0} />
        </View>
      </ScrollView>

      <PrimaryButton label="次へ" disabled={!canSubmit} onPress={handleSubmit} />
    </View>
  );
}
