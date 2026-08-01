import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { FlowStepper } from "@/components/ui/flow-stepper";
import { CandidateCard } from "@/features/election/candidate-card";
import { GoalModal } from "@/features/election/goal-modal";
import { mirrorWish } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";

export default function ElectionResultScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const motivation = useElectionStore((s) => s.motivation);
  const election = useElectionStore((s) => s.election);
  const setElection = useElectionStore((s) => s.setElection);
  const showProfileStep = useElectionStore((s) => s.showProfileStep);
  const addWish = useWishStore((s) => s.addWish);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const hasSource = Boolean(worry && motivation);

  // 開票の生成はcounting画面が担う。未開票でここに来たら投票中へ戻す。
  useEffect(() => {
    if (hasSource && !election) router.replace("/election/counting");
  }, [hasSource, election, router]);

  if (!hasSource) {
    return (
      <View className="flex-1 items-center justify-center bg-flow-bg px-8">
        <Text className="font-flow text-base text-flow-ink">
          悩みが選ばれていません
        </Text>
        <FlowButton
          label="悩みを選ぶ"
          onPress={() => router.replace("/election")}
          className="mt-4"
        />
      </View>
    );
  }

  if (!election) return null;

  const selectedCandidate =
    election.candidates.find(
      (candidate) => candidate.id === selectedCandidateId
    ) ?? null;

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
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="投票結果" />
      <ScrollView contentContainerClassName="px-5 pb-16 pt-3">
        <FlowStepper current={2} showProfileStep={showProfileStep} />

        <View className="mt-6 self-start rounded-full bg-flow-dark px-4 py-1.5">
          <Text className="font-flow text-xs text-white">開票結果</Text>
        </View>
        <Text className="mt-3 font-flow text-xl text-flow-ink">
          {election.themeLabel}
        </Text>
        <Text className="mt-2 font-flow-medium text-xs text-flow-ink-mid">
          あなたに近い1000人が踏み出した小さな一歩
        </Text>
        <Text className="mt-4 font-flow-medium text-sm leading-6 text-flow-ink-mid">
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

        <View className="mt-8 gap-3">
          <FlowButton
            label="この公約にする"
            disabled={!selectedCandidate}
            onPress={() => setModalVisible(true)}
          />
          <FlowButton
            label="再選挙する"
            variant="dashed"
            onPress={() => {
              setSelectedCandidateId(null);
              setElection(null);
            }}
          />
        </View>
        <Pressable
          onPress={() => router.replace("/election")}
          className="mt-3 items-center py-3"
        >
          <Text className="font-flow text-sm text-flow-ink-mid">
            別の悩みで開催する
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.dismissTo("/")}
          className="items-center py-3"
        >
          <Text className="font-flow text-sm text-flow-ink-low">
            ホームへ戻る
          </Text>
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
