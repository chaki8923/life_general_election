import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { Odometer, odometerTimeAtValue } from "@/components/ui/odometer";
import { generateElection } from "@/features/election/generate";
import { FONT, useDesignScale } from "@/features/election/layout";
import { mirrorElection } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";

const TOTAL_VOTES = 1000;
const COUNT_TARGET = TOTAL_VOTES;
/** Figma 1700:7742。招集画面を見せてから開票を始める */
const RECRUIT_DURATION_MS = 2000;
const REDUCED_MOTION_RECRUIT_MS = 800;
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

type PresentationPhase = "recruiting" | "counting" | "holding";

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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<PresentationPhase>("recruiting");
  const [animationFinished, setAnimationFinished] = useState(false);
  const [stage, setStage] = useState(0);

  // result.tsxから移設。開票生成はこの画面が担い、結果画面は表示に専念する。
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

  // 招集画面から開票へ移り、Figmaの票数に合わせて見出しを切り替える。
  useEffect(() => {
    if (reduceMotion) {
      setPhase("recruiting");
      setStage(STAGES.length - 1);
      setAnimationFinished(false);
      const timer = setTimeout(() => {
        setPhase("holding");
        setAnimationFinished(true);
      }, REDUCED_MOTION_RECRUIT_MS);
      return () => clearTimeout(timer);
    }

    setPhase("recruiting");
    setStage(0);
    setAnimationFinished(false);
    const recruitTimer = setTimeout(
      () => setPhase("counting"),
      RECRUIT_DURATION_MS
    );
    const timers = STAGES.slice(1).map((s2, i) =>
      setTimeout(
        () => setStage(i + 1),
        RECRUIT_DURATION_MS +
          COUNT_DURATION_MS *
            odometerTimeAtValue(s2.at, COUNT_TARGET, {
              slowFrom: COUNT_SLOW_FROM,
              slowTimeRatio: COUNT_SLOW_TIME_RATIO,
            })
      )
    );
    return () => {
      clearTimeout(recruitTimer);
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
            setPhase("recruiting");
            setAnimationFinished(false);
            setStage(0);
            setAttempt((current) => current + 1);
          }}
          className="mt-4"
        />
      </View>
    );
  }

  if (phase === "recruiting") {
    return (
      <View className="flex-1 overflow-hidden bg-white">
        {/* Figmaから書き出した招集背景。正式な動画が届けばsourceのみ差し替える。 */}
        <Image
          source={require("../../../assets/election/recruiting.png")}
          className="absolute inset-0"
          contentFit="cover"
          pointerEvents="none"
        />
        {/* 背景画像内の仮ステータスバーとヘッダーを実UIで覆う。 */}
        <FlowHeader title="モチベーション" />

        <Text
          className="text-center font-flow text-flow-ink"
          style={{
            position: "absolute",
            left: s(34),
            top: s(220),
            width: s(322),
            fontSize: s(28),
            lineHeight: s(44),
            letterSpacing: s(1.4),
          }}
        >
          あなたに近い{"\n"}1000人を{"\n"}招集しています…
        </Text>

        {/* 画像内の仮ホームインジケーターを端末の実表示に置き換える。 */}
        <View
          pointerEvents="none"
          className="absolute inset-x-0 bottom-0 bg-white"
          style={{ height: insets.bottom }}
        />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 overflow-hidden">
        {/* Figma注記では動く背景（GIF）予定。届いたらこのsourceを差し替えるだけ */}
        <Image
          source={require("../../../assets/election/arena.png")}
          className="absolute inset-0"
          contentFit="cover"
          pointerEvents="none"
        />

        <View
          className="items-end"
          style={{
            position: "absolute",
            left: s(35),
            width: s(322),
            top: "50%",
            marginTop: -s(90),
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
