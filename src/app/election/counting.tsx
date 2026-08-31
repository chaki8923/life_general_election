import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { FlowButton } from "@/components/ui/flow-button";
import { Odometer, odometerTimeAtValue } from "@/components/ui/odometer";
import { CountingBackground } from "@/features/election/counting-background";
import { generateElection } from "@/features/election/generate";
import { FONT, useDesignScale } from "@/features/election/layout";
import { selectPastPledgeResults } from "@/features/election/past-pledge-results";
import { mirrorElection } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";

const TOTAL_VOTES = 1000;
const COUNT_TARGET = TOTAL_VOTES;
/** 縮小モーション時はカウントアップを飛ばし、1000票の完成状態だけ見せる */
const REDUCED_MOTION_HOLD_MS = 800;
const COUNT_DURATION_MS = 7000;
/** 990台に入ったら失速させ、最後の数票をじっくり見せる */
const COUNT_SLOW_FROM = 960;
/** 全体の25%（1750ms）を960台の失速に充てる */
const COUNT_SLOW_TIME_RATIO = 0.25;
/** 1000票を見せてから結果へ移る */
const COMPLETE_HOLD_MS = 800;

/** Figma 1700:7757 / 1700:7749 / 1700:7765 の開票スナップショット */
const STAGES = [
  { at: 0, text: "みんなが次の一歩を\n投票してます" },
  { at: 663, text: "投票が\n集まってます" },
  { at: 993, text: "もうすぐで\n結果が出ます" },
] as const;

type PresentationPhase = "counting" | "holding";

export default function ElectionCountingScreen() {
  const router = useRouter();
  const { s } = useDesignScale();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const worry = useElectionStore((state) => state.worry);
  const motivation = useElectionStore((state) => state.motivation);
  const election = useElectionStore((state) => state.election);
  const setElection = useElectionStore((state) => state.setElection);
  const profile = useProfileStore((state) => state.profile);
  const wishes = useWishStore((state) => state.wishes);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<PresentationPhase>("counting");
  const [animationFinished, setAnimationFinished] = useState(false);
  const [stage, setStage] = useState(0);

  // 直近の「できた／できなかった」を渡し、その結果を踏まえた候補を出してもらう。
  // 配列を作り直すとdepsが毎レンダー変わって生成が止まらなくなるので、必ずメモ化する
  const pastResults = useMemo(() => selectPastPledgeResults(wishes), [wishes]);

  // result.tsxから移設。開票生成はこの画面が担い、結果画面は表示に専念する。
  useEffect(() => {
    if (!worry || !motivation || !profile || election) return;
    let cancelled = false;
    setFailed(false);
    generateElection({ worry, profile, motivation, pastResults })
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
  }, [worry, motivation, profile, election, pastResults, setElection, attempt]);

  // 開票を始め、Figmaの票数に合わせて見出しを切り替える。
  useEffect(() => {
    if (reduceMotion) {
      setPhase("holding");
      setStage(STAGES.length - 1);
      setAnimationFinished(false);
      const timer = setTimeout(
        () => setAnimationFinished(true),
        REDUCED_MOTION_HOLD_MS
      );
      return () => clearTimeout(timer);
    }

    setPhase("counting");
    setStage(0);
    setAnimationFinished(false);
    const timers = STAGES.slice(1).map((s2, i) =>
      setTimeout(
        () => setStage(i + 1),
        COUNT_DURATION_MS *
          odometerTimeAtValue(s2.at, COUNT_TARGET, {
            slowFrom: COUNT_SLOW_FROM,
            slowTimeRatio: COUNT_SLOW_TIME_RATIO,
          })
      )
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion, attempt]);

  // 1000票は一瞬で消さず、Figmaの完成状態を800ms見せる。
  useEffect(() => {
    if (phase !== "holding" || reduceMotion) return;
    const timer = setTimeout(
      () => setAnimationFinished(true),
      COMPLETE_HOLD_MS
    );
    return () => clearTimeout(timer);
  }, [phase, reduceMotion, attempt]);

  // AI結果と演出完了の両方が揃ったら結果へ。生成が遅い場合は1000票で待つ。
  useEffect(() => {
    if (election && animationFinished) router.replace("/election/result");
  }, [election, animationFinished, router]);

  if (!worry || !motivation || !profile) {
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

  if (failed) {
    return (
      <View className="flex-1 items-center justify-center bg-flow-bg px-8">
        <Text className="font-flow text-base text-flow-ink">
          開票に失敗しました…
        </Text>
        <FlowButton
          label="もう一度開票する"
          onPress={() => {
            setPhase("counting");
            setAnimationFinished(false);
            setStage(0);
            setAttempt((current) => current + 1);
          }}
          className="mt-4"
        />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* 地色は旧背景 arena.png の濃紺。動画の読み込み中に白文字が消えないようにする */}
      <View className="flex-1 overflow-hidden bg-[#0a1238]">
        <CountingBackground />

        <View
          className="items-end"
          style={{
            position: "absolute",
            left: s(35),
            width: s(322),
            // Figma 1700:7760 は -translate-y-1/2 なので、50%-90pxはブロックの中心
            top: "50%",
            marginTop: -s(90),
            transform: [{ translateY: "-50%" }],
            gap: s(20),
          }}
        >
          <View style={{ width: "100%", height: s(88) }}>
            <Animated.View
              key={`${attempt}-${stage}`}
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(160)}
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={2}
                className="w-full text-center font-flow text-white"
                style={{ fontSize: s(24), lineHeight: s(38) }}
              >
                {STAGES[stage].text}
              </Text>
            </Animated.View>
          </View>

          {/* 4桁ぶん確保し、999までは左端の透明な桁から右へ伸びて見せる。 */}
          <View className="w-full items-center">
            <Odometer
              key={attempt}
              value={COUNT_TARGET}
              digits={4}
              durationMs={COUNT_DURATION_MS}
              slowFrom={COUNT_SLOW_FROM}
              slowTimeRatio={COUNT_SLOW_TIME_RATIO}
              fontSize={s(130.5)}
              rowHeight={s(156)}
              letterSpacing={s(6.52)}
              onComplete={() => setPhase("holding")}
            />
            <View
              className={phase === "holding" ? "items-center" : "items-end"}
              style={{ width: phase === "holding" ? "100%" : s(254) }}
            >
              <Text
                style={{
                  fontFamily: FONT.counterRegular,
                  fontSize: s(27.5),
                  lineHeight: s(40),
                  color: "#ffffff",
                }}
              >
                /{TOTAL_VOTES}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
