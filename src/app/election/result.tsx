import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { FlowStepper } from "@/components/ui/flow-stepper";
import { GoalModal } from "@/features/election/goal-modal";
import { MinorityCarousel } from "@/features/election/minority-carousel";
import { RankedResultCard } from "@/features/election/ranked-result-card";
import { ResultHero } from "@/features/election/result-hero";
import type { ResultRank } from "@/features/election/result-theme";
import { mirrorWish } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useWishStore } from "@/stores/wishes";
import type { Candidate } from "@/types";
import { Pressable, ScrollView, Text, View } from "@/tw";

export default function ElectionResultScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const motivation = useElectionStore((s) => s.motivation);
  const election = useElectionStore((s) => s.election);
  const setElection = useElectionStore((s) => s.setElection);
  const showProfileStep = useElectionStore((s) => s.showProfileStep);
  const addWish = useWishStore((s) => s.addWish);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const hasSource = Boolean(worry && motivation);

  const { topThree, minorities } = useMemo(() => {
    if (!election) return { topThree: [], minorities: [] };
    const mainstream = election.candidates.filter((c) => !c.isMinority);
    const minority = election.candidates.filter((c) => c.isMinority);
    return {
      topThree: mainstream.slice(0, 3),
      minorities: minority,
    };
  }, [election]);

  useEffect(() => {
    if (hasSource && !election) router.replace("/election/counting");
  }, [hasSource, election, router]);

  const openGoalModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

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
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="投票結果" />
      <ScrollView contentContainerClassName="px-5 pb-16 pt-3">
        <FlowStepper current={2} showProfileStep={showProfileStep} />

        <ResultHero themeLabel={election.themeLabel} />

        <View className="mt-6 gap-4">
          {topThree.map((candidate, index) => (
            <RankedResultCard
              key={candidate.id}
              rank={(index + 1) as ResultRank}
              candidate={candidate}
              onProceed={() => openGoalModal(candidate)}
            />
          ))}
        </View>

        <MinorityCarousel
          candidates={minorities}
          onProceed={openGoalModal}
        />

        <View className="mt-8 gap-3">
          <FlowButton
            label="再選挙する"
            variant="dashed"
            onPress={() => setElection(null)}
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
