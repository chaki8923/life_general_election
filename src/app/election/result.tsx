import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { FlowStepper } from "@/components/ui/flow-stepper";
import { ProgressDots } from "@/components/ui/progress-dots";
import {
  FlowTabBarOverlay,
  useTabBarBottomPadding,
} from "@/components/ui/tab-bar";
import { GoalModal } from "@/features/election/goal-modal";
import { useDesignScale } from "@/features/election/layout";
import { PLEDGE_RANK_THEME_IDS, PLEDGE_THEMES } from "@/features/election/pledge-themes";
import { ResultPagedRow } from "@/features/election/result-paged-row";
import {
  MINORITY_PLEDGE_THEMES,
  ResultMinorityPledgeCard,
  ResultPledgeCard,
  type PledgeRank,
} from "@/features/election/result-pledge-card";
import { ResultTipCard } from "@/features/election/result-tip-card";
import { ResultUniqueVoicesSection } from "@/features/election/result-unique-voices-section";
import { mirrorWish } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useWishStore } from "@/stores/wishes";
import { ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate, PledgeThemeId } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

/** Figma 1905:13894 高解像度版（1264×842） */
const hero190513894 = require("../../../assets/election/result/hero-1905-13894-hq.png");

/** プレビュー用（未開票でも 1〜3位カードを表示） */
const FIGMA_FALLBACK_CANDIDATES: Candidate[] = [
  {
    id: "figma-fallback-1",
    label: "家計簿をつける",
    votes: 520,
    isMinority: false,
    comment: "",
    action: "ひと月にかかる費用を書き出す",
  },
  {
    id: "figma-fallback-2",
    label: "家計簿をつける",
    votes: 380,
    isMinority: false,
    comment: "",
    action: "ひと月にかかる費用を書き出す",
  },
  {
    id: "figma-fallback-3",
    label: "家計簿をつける",
    votes: 240,
    isMinority: false,
    comment: "",
    action: "ひと月にかかる費用を書き出す",
  },
];

const FIGMA_FALLBACK_MINORITY_CANDIDATES: Candidate[] = [
  {
    id: "figma-fallback-minority-1",
    label: "家計簿をつける",
    votes: 20,
    isMinority: true,
    comment: "",
    action: "ひと月にかかる費用を書き出す",
  },
  {
    id: "figma-fallback-minority-2",
    label: "家計簿をつける",
    votes: 10,
    isMinority: true,
    comment: "",
    action: "ひと月にかかる費用を書き出す",
  },
];

/** Tipsカード（公約、政策とは？）と同じページ間隔に統一（デザインpx） */
const MINORITY_CARD_GAP = 24;

type ModalSelection = {
  candidate: Candidate;
  pledgeThemeId: PledgeThemeId;
};

export default function ElectionResultScreen() {
  const router = useRouter();
  const { s } = useDesignScale();
  const worry = useElectionStore((state) => state.worry);
  const motivation = useElectionStore((state) => state.motivation);
  const election = useElectionStore((state) => state.election);
  const showProfileStep = useElectionStore((state) => state.showProfileStep);
  const addWish = useWishStore((state) => state.addWish);
  const hasSource = Boolean(worry && motivation);
  const [modalSelection, setModalSelection] = useState<ModalSelection | null>(
    null
  );
  const [minorityPage, setMinorityPage] = useState(0);
  const tabBarBottomPadding = useTabBarBottomPadding();
  const scrollBottomPadding = showProfileStep ? s(32) : tabBarBottomPadding;
  const minorityGap = s(MINORITY_CARD_GAP);

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

  const rankedCandidates: { rank: PledgeRank; candidate: Candidate }[] = (
    [1, 2, 3] as const
  ).map((rank) => ({
    rank,
    candidate:
      election.candidates[rank - 1] ?? FIGMA_FALLBACK_CANDIDATES[rank - 1],
  }));
  const topCandidate = rankedCandidates[0]?.candidate ?? null;
  const minorityCandidates = election.candidates
    .filter((c) => c.isMinority)
    .slice(0, 2);
  while (minorityCandidates.length < 2) {
    minorityCandidates.push(
      FIGMA_FALLBACK_MINORITY_CANDIDATES[minorityCandidates.length]
    );
  }
  const minoritySlides = [
    { candidate: minorityCandidates[0], pledgeThemeId: "green" as const },
    { candidate: minorityCandidates[1], pledgeThemeId: "blue" as const },
  ];
  const registerGoal = (deadline: number) => {
    const candidate = modalSelection?.candidate ?? topCandidate;
    if (!candidate) return;
    const pledgeThemeId = modalSelection?.pledgeThemeId ?? "pink";
    const wish = addWish({
      text: candidate.label,
      policy: candidate.action,
      deadline,
      sourceElectionId: election.id,
      pledgeThemeId,
    });
    mirrorWish(wish);
    setModalSelection(null);
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="投票結果" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {showProfileStep ? (
          <View style={{ paddingHorizontal: s(20), paddingVertical: s(4) }}>
            <FlowStepper current={2} showProfileStep />
          </View>
        ) : (
          <View style={{ height: s(4) }} />
        )}

        {/* Figma 1691:2823 — テキストを画像寄り（右）へ */}
        <View
          className="w-full flex-row items-center overflow-hidden"
          style={{
            paddingVertical: s(8),
            paddingLeft: s(28),
            paddingRight: s(8),
            gap: s(0),
          }}
        >
          <View
            className="shrink-0"
            style={{ width: s(161), gap: s(8) }}
          >
            <Text
              className="w-full font-flow text-flow-ink"
              style={{
                fontSize: s(19),
                lineHeight: s(28),
                letterSpacing: s(0.9),
              }}
            >
              {"みんなの声が\n集まりました！"}
            </Text>
            <Text
              className="font-flow-medium text-flow-ink"
              style={{
                width: s(155),
                fontSize: s(10),
                lineHeight: s(10 * 1.4),
              }}
            >
              {
                "1,000人の投票をもとに、\nあなたにおすすめの人生公約を\nご提案しました！"
              }
            </Text>
          </View>
          <View
            className="shrink-0"
            style={{
              height: s(148),
              width: s(212),
              marginTop: s(-8),
              marginLeft: s(-21),
            }}
          >
            <Image
              source={hero190513894}
              className="h-full w-full"
              contentFit="contain"
              accessibilityLabel="開票中のイラスト"
            />
          </View>
        </View>

        <View
          className="w-full"
          style={{ gap: s(20), paddingHorizontal: s(20) }}
        >
          <View style={{ marginTop: s(4) }}>
            <ResultTipCard recommendLabel={topCandidate?.label} />
          </View>

          {rankedCandidates.map(({ rank, candidate }) => (
            <ResultPledgeCard
              key={candidate.id}
              candidate={candidate}
              rank={rank}
              onConfirm={() =>
                setModalSelection({
                  candidate,
                  pledgeThemeId: PLEDGE_RANK_THEME_IDS[rank],
                })
              }
            />
          ))}

          <View className="w-full">
            <ResultUniqueVoicesSection />
            <ResultPagedRow
              pageCount={minoritySlides.length}
              gap={minorityGap}
              placeholderHeight={s(271)}
              onPageChange={setMinorityPage}
              renderPage={(index) => {
                const slide = minoritySlides[index];
                const theme = MINORITY_PLEDGE_THEMES[slide.pledgeThemeId];
                return (
                  <ResultMinorityPledgeCard
                    candidate={slide.candidate}
                    theme={theme}
                    onConfirm={() =>
                      setModalSelection({
                        candidate: slide.candidate,
                        pledgeThemeId: slide.pledgeThemeId,
                      })
                    }
                  />
                );
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: s(16) }}>
          <ProgressDots current={minorityPage} total={minoritySlides.length} />
        </View>
      </ScrollView>

      {!showProfileStep && (
        <FlowTabBarOverlay
          active="vote"
          onPress={(id) => {
            if (id === "index") router.replace("/");
            else if (id === "vote") router.replace("/(tabs)/vote");
            else router.replace("/(tabs)/achievements");
          }}
        />
      )}

      <GoalModal
        visible={Boolean(modalSelection)}
        candidate={modalSelection?.candidate ?? null}
        color={
          modalSelection
            ? PLEDGE_THEMES[modalSelection.pledgeThemeId].color
            : "#f4728a"
        }
        accentBg={
          modalSelection
            ? PLEDGE_THEMES[modalSelection.pledgeThemeId].avatarBg
            : "#fff6f5"
        }
        onRegister={registerGoal}
        onClose={() => setModalSelection(null)}
      />
    </View>
  );
}
