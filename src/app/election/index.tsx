import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { PRESET_WORRIES } from "@/constants/themes";
import { incrementThemeStat, mirrorWorry } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import type { Worry } from "@/types";

export default function WorrySelectScreen() {
  const router = useRouter();
  const setWorry = useElectionStore((s) => s.setWorry);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const selectedPreset = PRESET_WORRIES.find((w) => w.id === selectedId);
  const canSubmit = Boolean(selectedPreset || customText.trim());

  const handleSelectPreset = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setCustomText("");
  };

  const handleChangeText = (text: string) => {
    setCustomText(text);
    if (text.trim()) setSelectedId(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const worry: Worry = selectedPreset
      ? {
          id: `w-${Date.now().toString(36)}`,
          text: selectedPreset.label,
          category: selectedPreset.category,
          source: "preset",
          createdAt: Date.now(),
        }
      : {
          id: `w-${Date.now().toString(36)}`,
          text: customText.trim(),
          category: "その他",
          source: "custom",
          createdAt: Date.now(),
        };

    // DBへ保存（Firebase未設定時は自動的にスキップ）
    mirrorWorry(worry);
    if (selectedPreset) {
      incrementThemeStat(
        selectedPreset.id,
        selectedPreset.label,
        selectedPreset.category
      );
    }

    setWorry(worry);
    router.push("/election/result");
  };

  return (
    <View className="flex-1 bg-election-cream">
      <ScrollView contentContainerClassName="px-6 pb-40 pt-16">
        <Text className="text-sm font-bold tracking-widest text-election-red">
          第1回 1000人生総選挙
        </Text>
        <Text className="mt-2 text-3xl font-bold text-election-ink">
          いま、何に{"\n"}悩んでますか？
        </Text>
        <Text className="mt-2 text-sm text-election-ink/60">
          選ぶだけでOK。あなたに近い1000人の「小さな一歩」を勝手に開票します。
        </Text>

        <View className="mt-8 gap-3">
          {PRESET_WORRIES.map((w) => {
            const selected = w.id === selectedId;
            return (
              <Pressable
                key={w.id}
                onPress={() => handleSelectPreset(w.id)}
                className={`flex-row items-center gap-3 rounded-2xl border-2 px-4 py-4 ${
                  selected
                    ? "border-election-red bg-election-red"
                    : "border-election-ink/10 bg-election-paper"
                }`}
              >
                <Text className="text-2xl">{w.emoji}</Text>
                <View className="flex-1">
                  <Text
                    className={`text-base font-bold ${
                      selected ? "text-white" : "text-election-ink"
                    }`}
                  >
                    {w.label}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${
                      selected ? "text-white/70" : "text-election-ink/40"
                    }`}
                  >
                    {w.category}
                  </Text>
                </View>
                {selected && (
                  <Text className="text-lg font-bold text-white">✓</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-8 text-sm font-bold text-election-ink/60">
          または、自由に入力
        </Text>
        <TextInput
          value={customText}
          onChangeText={handleChangeText}
          placeholder="例: 30歳までに海外移住すべき？"
          placeholderTextColor="#2b2b2b55"
          multiline
          className="mt-2 min-h-20 rounded-2xl border-2 border-election-ink/10 bg-election-paper px-4 py-3 text-base text-election-ink"
        />
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 bg-election-cream/95 px-6 pb-10 pt-3">
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`items-center rounded-full py-4 ${
            canSubmit ? "bg-election-red" : "bg-election-ink/20"
          }`}
        >
          <Text className="text-lg font-bold text-white">
            🗳️ 総選挙を開催する
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
