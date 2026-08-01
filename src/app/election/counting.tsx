import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { FlowButton } from "@/components/ui/flow-button";
import { Odometer, odometerTimeAtValue } from "@/components/ui/odometer";
import { generateElection } from "@/features/election/generate";
import { FONT, useDesignScale } from "@/features/election/layout";
import { mirrorElection } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";

const TOTAL_VOTES = 1000;
/** 1000の直前で止め、結果画面へカットする */
const COUNT_TARGET = 999;
const COUNT_DURATION_MS = 7000;
/** 990台に入ったら失速させ、最後の数票をじっくり見せる */
const COUNT_SLOW_FROM = 960;
/** 全体の25%（1750ms）を960台の失速に充てる */
const COUNT_SLOW_TIME_RATIO = 0.25;
/** 999と最後の案内を600ms見せてから結果へ移る */
const MIN_DISPLAY_MS = COUNT_DURATION_MS;

/** 得票数の到達点ごとに切り替わる見出し（Figma 985:4816 / 985:4731 / 985:4801） */
const STAGES = [
  { at: 0, text: "みんなが次の一歩を\n投票しています" },
  { at: 300, text: "投票がどんどん\n集まっています" },
  { at: 700, text: "もうすぐで\n結果が出ます" },
] as const;

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
  const [minimumElapsed, setMinimumElapsed] = useState(false);
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

  // 最低限の演出時間は確保し、モーション軽減時は待たせない
  useEffect(() => {
    if (reduceMotion) {
      setMinimumElapsed(true);
      return;
    }
    setMinimumElapsed(false);
    const timer = setTimeout(() => setMinimumElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [attempt, reduceMotion]);

  // 見出しはカウントのイージングに合わせて切り替える
  useEffect(() => {
    if (reduceMotion) {
      setStage(STAGES.length - 1);
      return;
    }
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
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion, attempt]);

  // AI結果と最低演出時間の両方が揃ったら、1000票の前に結果へ
  useEffect(() => {
    if (election && minimumElapsed) router.replace("/election/result");
  }, [election, minimumElapsed, router]);

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
            setMinimumElapsed(false);
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

          {/* 右端をそろえて桁が左へ伸びる＝オドメーターらしい見え方にする */}
          <View className="items-end">
            <Odometer
              key={attempt}
              value={COUNT_TARGET}
              digits={3}
              durationMs={COUNT_DURATION_MS}
              slowFrom={COUNT_SLOW_FROM}
              slowTimeRatio={COUNT_SLOW_TIME_RATIO}
              fontSize={s(130.5)}
              rowHeight={s(156)}
              letterSpacing={s(6.52)}
            />
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
  );
}
