import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { FlowStepper } from "@/components/ui/flow-stepper";
import { BubbleField } from "@/features/election/bubble-field";
import { generateWorrySuggestions } from "@/features/election/generate-worries";
import { useDesignScale } from "@/features/election/layout";
import { WorryConfirmModal } from "@/features/election/worry-confirm-modal";
import { mirrorWorry } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import type { Worry, WorrySuggestion } from "@/types";

/** モックが即返っても画面01を一瞬で通り過ぎないための最低待ち時間 */
const MIN_LOADING_MS = 1200;

/** 以下すべてCONTENT_TOP（ステッパー下端）を原点にしたアートボード座標 */
const HEADING_TOP = 148.7;
const HEADING_LEFT = 49;
const HEADING_WIDTH = 292;
/** 見出しブロック(28px×2行)の下に空けるgap */
const HEADING_TO_BUTTON_GAP = 34;
const HEADING_HEIGHT = 88;

const BRAIN_SIZE = 664;
const BRAIN_LEFT = -134;
const BRAIN_TOP_INTRO = 287.7;
const BRAIN_TOP_PICKING = 410.7;
/** 吹き出しが飛び出す起点（脳の上のほう） */
const BRAIN_ORIGIN_X = 195;
const BRAIN_ORIGIN_Y = BRAIN_TOP_PICKING + 140;

export default function WorrySuggestScreen() {
  const router = useRouter();
  const { s } = useDesignScale();
  const reduceMotion = useReducedMotion();
  const interest = useElectionStore((state) => state.interest);
  const worryCandidates = useElectionStore((state) => state.worryCandidates);
  const setWorryCandidates = useElectionStore(
    (state) => state.setWorryCandidates
  );
  const setWorry = useElectionStore((state) => state.setWorry);
  const showProfileStep = useElectionStore((state) => state.showProfileStep);
  const profile = useProfileStore((state) => state.profile);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<WorrySuggestion | null>(null);

  const intro = useSharedValue(1);
  /** 脳の下方向オフセット（実機px）。レイアウトではなくtransformで動かす */
  const brainShift = useSharedValue(0);

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

  const introStyle = useAnimatedStyle(() => ({
    opacity: intro.value,
    transform: [{ scale: 0.4 + 0.6 * intro.value }],
  }));
  const brainStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: brainShift.value }],
  }));

  // 画面01 → 02（見出しとボタンが縮んで消え、脳が下がる）→ 03/04（吹き出しがポップ）
  const startPicking = () => {
    setPicking(true);
    const shift = s(BRAIN_TOP_PICKING - BRAIN_TOP_INTRO);
    if (reduceMotion) {
      intro.value = 0;
      brainShift.value = shift;
      return;
    }
    intro.value = withTiming(0, { duration: 320 });
    brainShift.value = withTiming(shift, { duration: 600 });
  };

  const handleConfirm = () => {
    if (!selected) return;
    const confirmed = selected;
    // Modalのvisible条件を先にfalseにし、画面遷移中に残らないようにする
    setSelected(null);
    const worry: Worry = {
      id: `w-${Date.now().toString(36)}`,
      text: confirmed.label,
      category: confirmed.category,
      source: "ai",
      createdAt: Date.now(),
    };
    // DBへ保存（Firebase未設定時は自動的にスキップ）
    mirrorWorry(worry);
    setWorry(worry);
    router.push("/election/motivation");
  };

  // 直リンク等で上流状態がない場合は興味関心の選択からやり直し
  if (!interest || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-flow-bg px-8">
        <Text className="font-flow text-base text-flow-ink">
          興味・関心が選ばれていません
        </Text>
        <FlowButton
          label="興味・関心を選ぶ"
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
          ヒアリングに失敗しました…
        </Text>
        <FlowButton
          label="もう一度ヒアリングする"
          onPress={() => setAttempt((a) => a + 1)}
          className="mt-4"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="お悩み選択" />
      <View className="mt-3">
        <FlowStepper current={1} showProfileStep={showProfileStep} />
      </View>

      {/* ここから下はFigmaの絶対座標レイアウト。脳がはみ出すのでクリップする */}
      <View className="flex-1 overflow-hidden">
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: s(BRAIN_LEFT),
              top: s(BRAIN_TOP_INTRO),
              width: s(BRAIN_SIZE),
              height: s(BRAIN_SIZE),
            },
            brainStyle,
          ]}
        >
          <Image
            source={require("../../../assets/election/brain.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </Animated.View>

        {picking && worryCandidates ? (
          <BubbleField
            candidates={worryCandidates}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            originX={BRAIN_ORIGIN_X}
            originY={BRAIN_ORIGIN_Y}
          />
        ) : null}

        <Animated.View
          pointerEvents={picking ? "none" : "auto"}
          style={[
            {
              position: "absolute",
              left: s(HEADING_LEFT),
              top: s(HEADING_TOP),
              width: s(HEADING_WIDTH),
            },
            introStyle,
          ]}
        >
          <View style={{ height: s(HEADING_HEIGHT) }}>
            <View
              style={{
                height: s(44),
                flexDirection: "row",
                alignItems: "baseline",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                className="font-flow text-flow-ink"
                style={{ fontSize: s(28), lineHeight: s(44) }}
              >
                あなたの
              </Text>
              <Text
                numberOfLines={1}
                className="font-flow text-flow-pink"
                style={{ fontSize: s(32), lineHeight: s(44) }}
              >
                悩み
              </Text>
              <Text
                numberOfLines={1}
                className="font-flow text-flow-ink"
                style={{ fontSize: s(28), lineHeight: s(44) }}
              >
                に
              </Text>
            </View>
            <View style={{ height: s(44), justifyContent: "center" }}>
              <Text
                numberOfLines={1}
                className="text-center font-flow text-flow-ink"
                style={{ fontSize: s(28), lineHeight: s(44) }}
              >
                近いものを選んでね
              </Text>
            </View>
          </View>
          <View style={{ height: s(HEADING_TO_BUTTON_GAP) }} />
          <FlowButton
            label="選ぶ"
            loading={!worryCandidates}
            onPress={startPicking}
          />
        </Animated.View>
      </View>

      <WorryConfirmModal
        visible={selected !== null}
        candidate={selected}
        onConfirm={handleConfirm}
        onReselect={() => setSelected(null)}
      />
    </View>
  );
}
