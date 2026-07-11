import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { generateElection } from "@/features/election/generate";
import { mirrorElection } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import type { Candidate } from "@/types";

function VoteBar({
  candidate,
  maxVotes,
  rank,
}: {
  candidate: Candidate;
  maxVotes: number;
  rank: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      rank * 250,
      withTiming(1, { duration: 900 })
    );
  }, [progress, rank]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const isTop = rank === 0;
  const ratio = maxVotes > 0 ? candidate.votes / maxVotes : 0;

  return (
    <View
      className={`rounded-2xl border-2 p-4 ${
        isTop
          ? "border-election-gold bg-election-paper"
          : candidate.isMinority
            ? "border-dashed border-election-pink/50 bg-election-paper"
            : "border-election-ink/10 bg-election-paper"
      }`}
    >
      <View className="flex-row items-center gap-2">
        <Text className="w-7 text-lg font-bold text-election-ink/40">
          {rank + 1}
        </Text>
        <Text className="flex-1 text-base font-bold text-election-ink">
          {candidate.label}
        </Text>
        {isTop && (
          <View className="rounded-md bg-election-red px-2 py-1">
            <Text className="text-xs font-bold text-white">当確</Text>
          </View>
        )}
        {candidate.isMinority && (
          <View className="rounded-md bg-election-pink px-2 py-1">
            <Text className="text-xs font-bold text-white">マイノリティ</Text>
          </View>
        )}
      </View>

      <View className="mt-3 h-4 overflow-hidden rounded-full bg-election-ink/10">
        <Animated.View
          className={`h-full rounded-full ${
            isTop
              ? "bg-election-gold"
              : candidate.isMinority
                ? "bg-election-pink"
                : "bg-election-red"
          }`}
          style={[
            { width: `${Math.max(ratio * 100, 4)}%`, transformOrigin: "left" },
            barStyle,
          ]}
        />
      </View>

      <View className="mt-2 flex-row items-baseline justify-between">
        <Text className="text-xs text-election-ink/50">
          「{candidate.comment}」
        </Text>
        <Text className="text-sm font-bold text-election-ink">
          {candidate.votes}票
        </Text>
      </View>

      <View className="mt-2 rounded-lg bg-election-cream px-3 py-2">
        <Text className="text-xs text-election-ink/70">
          👟 今日の一歩: {candidate.action}
        </Text>
      </View>
    </View>
  );
}

export default function ElectionResultScreen() {
  const router = useRouter();
  const worry = useElectionStore((s) => s.worry);
  const election = useElectionStore((s) => s.election);
  const setElection = useElectionStore((s) => s.setElection);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // 注意: setElectionによるzustandの同期flushでこのeffectのクリーンアップが
  // .finallyより先に走るため、「loading state + cancelledガード」方式はデッドロックする。
  // 画面状態はelection/failedのみから導出する。
  useEffect(() => {
    if (!worry || election) return;
    let cancelled = false;
    setFailed(false);
    generateElection(worry)
      .then((e) => {
        if (cancelled) return;
        setElection(e);
        mirrorElection(e); // DBへ結果を保存（未設定時はスキップ）
      })
      .catch((e) => {
        if (__DEV__) console.warn("[election]", e);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [worry, election, setElection, attempt]);

  if (!worry) {
    return (
      <View className="flex-1 items-center justify-center bg-election-cream px-8">
        <Text className="text-base text-election-ink">
          悩みが選ばれていません
        </Text>
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
        <Text className="text-base text-election-ink">
          開票に失敗しました…
        </Text>
        <Pressable
          onPress={() => setAttempt((a) => a + 1)}
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

  const maxVotes = election.candidates[0]?.votes ?? 0;

  return (
    <View className="flex-1 bg-election-cream">
      <ScrollView contentContainerClassName="px-6 pb-16 pt-16">
        <Text className="text-sm font-bold tracking-widest text-election-red">
          開票結果
        </Text>
        <Text className="mt-2 text-2xl font-bold text-election-ink">
          {election.themeLabel}
        </Text>
        <Text className="mt-1 text-sm text-election-ink/60">
          あなたに近い{election.totalVotes}人が踏み出した一歩
        </Text>

        <View className="mt-6 gap-3">
          {election.candidates.map((c, i) => (
            <VoteBar key={c.id} candidate={c} maxVotes={maxVotes} rank={i} />
          ))}
        </View>

        <Pressable
          onPress={() => router.replace("/election")}
          className="mt-8 items-center rounded-full bg-election-red py-4"
        >
          <Text className="text-lg font-bold text-white">
            別の悩みで開催する
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.dismissTo("/")}
          className="mt-3 items-center rounded-full border-2 border-election-ink/20 py-4"
        >
          <Text className="text-base font-bold text-election-ink">
            ホームへ戻る
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
