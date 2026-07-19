import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { CandidateCard } from "@/features/election/candidate-card";
import { generateElection } from "@/features/election/generate";
import { GoalModal } from "@/features/election/goal-modal";
import { mirrorElection, mirrorWish } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";

export default function ElectionResultScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const motivation = useElectionStore((s) => s.motivation);
  const election = useElectionStore((s) => s.election);
  const setElection = useElectionStore((s) => s.setElection);
  const profile = useProfileStore((s) => s.profile);
  const addWish = useWishStore((s) => s.addWish);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!worry || !motivation || !profile || election) return;
    let cancelled = false;
    setFailed(false);
    generateElection({ worry, profile, motivation })
      .then((generated) => {
        if (cancelled) return;
        setElection(generated);
        mirrorElection(generated);
      })
      .catch((error) => {
        if (__DEV__) console.warn("[election]", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [worry, motivation, profile, election, setElection, attempt]);

  if (!worry || !motivation) {
    return (
      <View className="flex-1 items-center justify-center bg-election-cream px-8">
        <Text className="text-base text-election-ink">悩みが選ばれていません</Text>
        <Pressable
          onPress={() => router.replace("/election")}
          className="mt-4 rounded-full bg-election-red px-6 py-3"
        >
          <Text className="font-bold text-white">悩みを選ぶ</Text>
        </Pressable>
      </View>
    );
  }

  if (failed) {
    return (
      <View className="flex-1 items-center justify-center bg-election-cream px-8">
        <Text className="text-base text-election-ink">開票に失敗しました…</Text>
        <Pressable
          onPress={() => setAttempt((current) => current + 1)}
          className="mt-4 rounded-full bg-election-red px-6 py-3"
        >
          <Text className="font-bold text-white">もう一度開票する</Text>
        </Pressable>
      </View>
    );
  }

  if (!election) {
    return (
      <View className="flex-1 items-center justify-center bg-election-navy px-8">
        <Text className="text-5xl">🗳️</Text>
        <Text className="mt-6 text-xl font-bold text-white">開票作業中…</Text>
        <Text className="mt-2 text-center text-sm text-white/60">
          あなたに近い1000人の{"\n"}「小さな一歩」を集計しています
        </Text>
      </View>
    );
  }

  const selectedCandidate =
    election.candidates.find((candidate) => candidate.id === selectedCandidateId) ??
    null;

  const registerGoal = (deadline: number) => {
    if (!selectedCandidate) return;
    const wish = addWish({
      text: selectedCandidate.label,
      policy: selectedCandidate.action,
      deadline,
      sourceElectionId: election.id,
    });
    mirrorWish(wish);
    setModalVisible(false);
    router.replace("/mypage");
  };

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      <ScrollView contentContainerClassName="px-5 pb-16 pt-16">
        <View className="self-start rounded-full bg-[#737373] px-4 py-1.5">
          <Text className="text-xs font-bold text-white">開票結果</Text>
        </View>
        <Text className="mt-3 text-xl font-bold text-[#333333]">
          {election.themeLabel}
        </Text>
        <Text className="mt-2 text-xs text-[#333333]">
          あなたに近い1000人が踏み出した小さな一歩
        </Text>
        <Text className="mt-4 text-sm leading-6 text-[#333333]">
          3日以内に実現できそうな政策(目標)を選んで{"\n"}
          あなたの公約を決めましょう
        </Text>

        <View className="mt-6 gap-4">
          {election.candidates.map((candidate, rank) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              totalVotes={election.totalVotes}
              rank={rank}
              selected={candidate.id === selectedCandidateId}
              onSelect={() => setSelectedCandidateId(candidate.id)}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={!selectedCandidate}
          className={`mt-8 h-12 items-center justify-center rounded-full ${
            selectedCandidate ? "bg-[#555555]" : "bg-[#cccccc]"
          }`}
        >
          <Text className="text-base font-bold text-white">この公約にする</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setSelectedCandidateId(null);
            setElection(null);
          }}
          className="mt-3 h-12 items-center justify-center rounded-full border-2 border-[#737373]"
        >
          <Text className="text-base font-bold text-[#555555]">再選挙する</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/election")}
          className="mt-3 items-center py-3"
        >
          <Text className="text-sm font-bold text-[#555555]">別の悩みで開催する</Text>
        </Pressable>
        <Pressable onPress={() => router.dismissTo("/")} className="items-center py-3">
          <Text className="text-sm font-bold text-[#999999]">ホームへ戻る</Text>
        </Pressable>
      </ScrollView>

      <GoalModal
        visible={modalVisible}
        candidate={selectedCandidate}
        onRegister={registerGoal}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
