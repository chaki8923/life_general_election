import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StepDots } from "@/components/ui/step-dots";
import { generateWorrySuggestions } from "@/features/election/generate-worries";
import { mirrorWorry } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import type { Worry } from "@/types";

/** モックの即時解決でも「ヒアリング中…」が読める最低表示時間 */
const MIN_LOADING_MS = 1200;

export default function WorrySuggestScreen() {
  const router = useRouter();
  const interest = useElectionStore((s) => s.interest);
  const worryCandidates = useElectionStore((s) => s.worryCandidates);
  const setWorryCandidates = useElectionStore((s) => s.setWorryCandidates);
  const setWorry = useElectionStore((s) => s.setWorry);
  const profile = useProfileStore((s) => s.profile);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // result.tsxと同じく、setWorryCandidatesのzustand同期flushでeffectクリーンアップが
  // 先に走る問題を避けるため、画面状態はworryCandidates/failedのみから導出する。
  useEffect(() => {
    if (!interest || !profile || worryCandidates) return;
    let cancelled = false;
    setFailed(false);
    Promise.all([
      generateWorrySuggestions(profile, interest),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
    ])
      .then(([candidates]) => {
        if (!cancelled) setWorryCandidates(candidates);
      })
      .catch((e) => {
        if (__DEV__) console.warn("[worries]", e);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [interest, profile, worryCandidates, setWorryCandidates, attempt]);

  // 直リンク等で上流状態がない場合は興味関心の選択からやり直し
  if (!interest || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-base text-election-ink">
          興味・関心が選ばれていません
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

  if (failed) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-base text-election-ink">
          ヒアリングに失敗しました…
        </Text>
        <Pressable
          onPress={() => setAttempt((a) => a + 1)}
          className="mt-4 rounded-full bg-election-red px-6 py-3"
        >
          <Text className="font-bold text-white">もう一度ヒアリングする</Text>
        </Pressable>
      </View>
    );
  }

  if (!worryCandidates) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-xl leading-7 text-election-ink">
          あなたに近い1000人に{"\n"}悩みをヒアリング中…
        </Text>
      </View>
    );
  }

  const selectedCandidate = worryCandidates.find((w) => w.id === selectedId);

  const handleSubmit = () => {
    if (!selectedCandidate) return;
    const worry: Worry = {
      id: `w-${Date.now().toString(36)}`,
      text: selectedCandidate.label,
      category: selectedCandidate.category,
      source: "ai",
      createdAt: Date.now(),
    };
    // DBへ保存（Firebase未設定時は自動的にスキップ）
    mirrorWorry(worry);
    setWorry(worry);
    router.push("/election/motivation");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-3 pb-44 pt-12">
        <Text className="text-center text-xl text-election-ink">
          あなたの悩みに{"\n"}近いものを選んでください
        </Text>
        <Text className="mt-3 text-center text-xs text-election-ink/70">
          1000人の「小さな政策」を勝手に開票します
        </Text>

        <View className="mt-8 gap-9">
          {worryCandidates.map((w) => {
            const isSelected = w.id === selectedId;
            return (
              <Pressable
                key={w.id}
                onPress={() => setSelectedId(w.id)}
                className={`items-center rounded-xl border-2 bg-white px-3 py-2.5 shadow-md shadow-black/25 ${
                  isSelected ? "border-election-red" : "border-transparent"
                }`}
              >
                <Text className="text-sm text-election-ink">{w.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-10">
          <StepDots total={3} current={1} />
        </View>
      </ScrollView>

      <PrimaryButton
        label="次へ"
        disabled={!selectedCandidate}
        onPress={handleSubmit}
      />
    </View>
  );
}
