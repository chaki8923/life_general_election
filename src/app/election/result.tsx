import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { FlowStepper } from "@/components/ui/flow-stepper";
import {
  FlowTabBarOverlay,
  useTabBarBottomPadding,
} from "@/components/ui/tab-bar";
import { GoalModal } from "@/features/election/goal-modal";
import {
  MINORITY_PLEDGE_THEMES,
  PLEDGE_RANK_THEMES,
  ResultMinorityPledgeCard,
  ResultPledgeCard,
  type PledgeRank,
} from "@/features/election/result-pledge-card";
import { ResultProgressDots } from "@/features/election/result-progress-dots";
import { ResultTipCard } from "@/features/election/result-tip-card";
import { ResultUniqueVoicesSection } from "@/features/election/result-unique-voices-section";
import { mirrorWish } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useWishStore } from "@/stores/wishes";
import { ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView as RNScrollView } from "react-native";

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

/** Tipsカード（公約、政策とは？）と同じページ間隔に統一 */
const MINORITY_CARD_GAP = 24;

type ModalSelection = {
  candidate: Candidate;
  color: string;
  accentBg: string;
};

export default function ElectionResultScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const motivation = useElectionStore((s) => s.motivation);
  const election = useElectionStore((s) => s.election);
  const showProfileStep = useElectionStore((s) => s.showProfileStep);
  const addWish = useWishStore((s) => s.addWish);
  const hasSource = Boolean(worry && motivation);
  const [modalSelection, setModalSelection] = useState<ModalSelection | null>(
    null
  );
  const [minorityPage, setMinorityPage] = useState(0);
  const [minorityWidth, setMinorityWidth] = useState(0);
  const tabBarPadding = useTabBarBottomPadding();

  // 開票の生成は counting が担う。未開票なら投票中へ戻す。
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
    { candidate: minorityCandidates[0], theme: MINORITY_PLEDGE_THEMES.green },
    { candidate: minorityCandidates[1], theme: MINORITY_PLEDGE_THEMES.blue },
  ];
  const minorityStride = minorityWidth + MINORITY_CARD_GAP;
  const registerGoal = (deadline: number) => {
    const candidate = modalSelection?.candidate ?? topCandidate;
    if (!candidate) return;
    const wish = addWish({
      text: candidate.label,
      policy: candidate.action,
      deadline,
      sourceElectionId: election.id,
    });
    mirrorWish(wish);
    setModalSelection(null);
    router.replace("/");
  };

  const onMinorityScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (minorityWidth <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / minorityStride);
    setMinorityPage(Math.max(0, Math.min(minoritySlides.length - 1, next)));
  };

  return (
    <View className="flex-1 bg-white">
      {/* 704:9790 — FlowHeader（画像モックから差し替え） */}
      <FlowHeader title="投票結果" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* 893:3409 — FlowStepper（画像モックから差し替え） */}
        <View className="px-5 py-2">
          <FlowStepper current={2} showProfileStep={showProfileStep} />
        </View>

        {/* 1691:2823 + 1905:13894 — 見出し + 開票ボード付きヒーロー */}
        <View className="relative h-[150px] w-[350px] right-5 self-center py-3">
          <View className="w-[161px] gap-2">
            <Text className="w-full font-flow text-[20px] leading-[28px] tracking-[0.9px] text-flow-ink">
              {"みんなの声が\n集まりました！"}
            </Text>
            <Text className="w-[200px] font-flow-medium text-[13px] leading-[1.4] text-flow-ink">
              {
                "1,000人の投票をもとに、\nあなたにおすすめの人生公約を\nご提案しました！"
              }
            </Text>
          </View>
          <View className="absolute left-[180px] top-0 h-[146px] w-[220px]">
            <Image
              source={hero190513894}
              className="h-full w-full"
              contentFit="contain"
              accessibilityLabel="開票中のイラスト"
            />
          </View>
        </View>

        {/* Figma: 左右20 / 幅350 の本文列 */}
        <View className="gap-5 px-5">
          {/* 1105:17350 — Tips（スワイプで 1/2↔2/2） */}
          <View className="mt-3">
            <ResultTipCard recommendLabel={topCandidate?.label} />
          </View>

          {/* 704:9825 / 704:9826 / 704:9827 — 1〜3位カード */}
          {rankedCandidates.map(({ rank, candidate }) => {
            const theme = PLEDGE_RANK_THEMES[rank];
            return (
              <ResultPledgeCard
                key={candidate.id}
                candidate={candidate}
                rank={rank}
                onConfirm={() =>
                  setModalSelection({
                    candidate,
                    color: theme.color,
                    accentBg: theme.avatarBg,
                  })
                }
              />
            );
          })}

          {/* 1691:2848 + 1905:13968 → 886:3300 マイノリティカード */}
          <View className="gap-0">
            <ResultUniqueVoicesSection />
            <View onLayout={(e) => setMinorityWidth(e.nativeEvent.layout.width)}>
              {minorityWidth > 0 ? (
                <RNScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onMinorityScrollEnd}
                  decelerationRate="fast"
                  snapToInterval={minorityStride}
                  snapToAlignment="start"
                  disableIntervalMomentum
                >
                  {minoritySlides.map((slide, index) => (
                    <View
                      key={slide.candidate.id}
                      style={{
                        width: minorityWidth,
                        marginRight:
                          index < minoritySlides.length - 1
                            ? MINORITY_CARD_GAP
                            : 0,
                      }}
                    >
                      <ResultMinorityPledgeCard
                        candidate={slide.candidate}
                        theme={slide.theme}
                        onConfirm={() =>
                          setModalSelection({
                            candidate: slide.candidate,
                            color: slide.theme.color,
                            accentBg: slide.theme.avatarBg,
                          })
                        }
                      />
                    </View>
                  ))}
                </RNScrollView>
              ) : (
                <View className="h-[271px]" />
              )}
            </View>
          </View>
        </View>

        {/* 1012:3606 — ページドット */}
        <View className="mt-4">
          <ResultProgressDots
            current={minorityPage}
            total={minoritySlides.length}
          />
        </View>
      </ScrollView>

      {/* 1679:8798 — BottomNav（投票するアクティブ） */}
      <FlowTabBarOverlay
        active="vote"
        onPress={(id) => {
          if (id === "index") router.replace("/");
          else if (id === "vote") router.replace("/(tabs)/vote");
          else router.replace("/(tabs)/achievements");
        }}
      />

      <GoalModal
        visible={Boolean(modalSelection)}
        candidate={modalSelection?.candidate ?? null}
        color={modalSelection?.color ?? "#f4728a"}
        accentBg={modalSelection?.accentBg ?? "#fff6f5"}
        onRegister={registerGoal}
        onClose={() => setModalSelection(null)}
      />
    </View>
  );
}
