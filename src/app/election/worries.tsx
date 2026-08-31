import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import {
  WORRIES_BACKGROUND,
  WORRY_CHARACTER,
} from "@/constants/election-images";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { ElectionFlowStepper } from "@/features/election/election-flow-stepper";
import { BubbleField } from "@/features/election/bubble-field";
import { generateWorrySuggestions } from "@/features/election/generate-worries";
import { CONTENT_TOP, useDesignScale } from "@/features/election/layout";
import { fitBubbleFontSize } from "@/features/election/worry-bubble-slots";
import { WorryConfirmModal } from "@/features/election/worry-confirm-modal";
import { mirrorWorry } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import type { Worry, WorrySuggestion } from "@/types";

/** モックが即返っても画面01を一瞬で通り過ぎないための最低待ち時間 */
const MIN_LOADING_MS = 1200;

/** 以下すべてCONTENT_TOP（ステッパー下端）を原点にしたアートボード座標 */
const HEADING_TOP = 131.706;
const HEADING_LEFT = 52;
const HEADING_WIDTH = 292;
/** 見出しブロック(28px×2行)の下に空けるgap */
const HEADING_TO_BUTTON_GAP = 34;
const HEADING_HEIGHT = 88;

/** Figma 1700:6814 のキャラ矩形（絶対 x:-40 y:562 / 471×707）。導入・吹き出しで動かない */
const CHARACTER_LEFT = -40;
const CHARACTER_TOP = 407.7;
const CHARACTER_WIDTH = 471;
const CHARACTER_HEIGHT = 707;
/** 吹き出しが飛び出す起点（キャラの中心x = -40 + 471/2） */
const CHARACTER_ORIGIN_X = 195;
const CHARACTER_ORIGIN_Y = CHARACTER_TOP + 140;

/** Figma 2215:18535。おでこに乗る案内文（絶対 y:674 → CONTENT_TOP基準） */
const FOREHEAD_LEFT = 101;
const FOREHEAD_TOP = 674 - CONTENT_TOP;
const FOREHEAD_WIDTH = 188;

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
  const profile = useProfileStore((state) => state.profile);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<WorrySuggestion | null>(null);
  /** 吹き出しが捌け終わって確認フェーズに入ったか */
  const [confirming, setConfirming] = useState(false);
  const selectedBubbleIndex = selected
    ? (worryCandidates?.findIndex((candidate) => candidate.id === selected.id) ??
      -1)
    : -1;
  // 5枚バラバラに詰めると1枚だけ極端に小さくなるので、全部を同じサイズに揃える。
  // 確認画面も同じ値を相似拡大するので改行位置が一致する
  const bubbleFontSize = useMemo(
    () => fitBubbleFontSize((worryCandidates ?? []).map((c) => c.label)),
    [worryCandidates]
  );

  const intro = useSharedValue(1);
  const introShift = s(406);

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

  const introStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        intro.value,
        [0, 0.25, 1],
        [0, 1, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        { translateY: introShift * (1 - intro.value) },
        { scale: 0.408 + 0.592 * intro.value },
      ],
    }),
    [introShift]
  );

  // 画面02 →（見出しとボタンが縮んで消える）→ 03/04（吹き出しがポップ）
  // Figmaではキャラが両画面で同じ位置なので、キャラ自体は動かさない
  const startPicking = () => {
    setPicking(true);
    if (reduceMotion) {
      intro.value = 0;
      return;
    }
    intro.value = withTiming(0, { duration: 600 });
  };

  // 捌けている最中に別の吹き出しを選び直せないようにする
  const handleSelect = (candidate: WorrySuggestion) => {
    if (selected) return;
    setSelected(candidate);
  };

  const handleReselect = () => {
    // scatter/focusがfalseに戻るので、吹き出しが左右から定位置へ帰ってくる
    setConfirming(false);
    setSelected(null);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const confirmed = selected;
    // 確認表示のvisible条件を先にfalseにし、画面遷移中に残らないようにする
    setConfirming(false);
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
      <Image
        source={WORRIES_BACKGROUND}
        className="absolute inset-0"
        contentFit="fill"
        pointerEvents="none"
      />
      <FlowHeader title="お悩み選択" />
      <ElectionFlowStepper current={1} className="mt-3" />

      {/* ここから下はFigmaの絶対座標レイアウト。キャラがはみ出すのでクリップする */}
      <View className="flex-1 overflow-hidden">
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: s(CHARACTER_LEFT),
            top: s(CHARACTER_TOP),
            width: s(CHARACTER_WIDTH),
            height: s(CHARACTER_HEIGHT),
          }}
        >
          <Image
            source={WORRY_CHARACTER}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </View>

        {/* 吹き出し表示中だけ、キャラのおでこに案内文を重ねる */}
        {picking ? (
          <Animated.Text
            entering={reduceMotion ? undefined : FadeIn.delay(300).duration(300)}
            pointerEvents="none"
            numberOfLines={2}
            className="text-center font-flow text-flow-ink"
            style={{
              position: "absolute",
              left: s(FOREHEAD_LEFT),
              top: s(FOREHEAD_TOP),
              width: s(FOREHEAD_WIDTH),
              fontSize: s(20),
              lineHeight: s(32),
              letterSpacing: s(1),
            }}
          >
            あなたの悩みに{"\n"}近いものを選んでね
          </Animated.Text>
        ) : null}

        {picking && worryCandidates ? (
          <BubbleField
            candidates={worryCandidates}
            fontSize={bubbleFontSize}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            onFocusEnd={() => setConfirming(true)}
            originX={CHARACTER_ORIGIN_X}
            originY={CHARACTER_ORIGIN_Y}
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
          {/* 1つのTextに2行入れると高さ88の枠で2行目が切れるので、行ごとに箱を持つ */}
          <View style={{ height: s(HEADING_HEIGHT) }}>
            {["あなたの興味から", "悩みを見つけてきたよ"].map((line) => (
              <View
                key={line}
                // 「悩みを見つけてきたよ」は280pxで枠292pxとほぼ同幅。行だけ左右に
                // 逃がして三点リーダ化を防ぐ（下のボタンは292のまま）
                style={{
                  height: s(44),
                  marginHorizontal: -s(24),
                  justifyContent: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  className="text-center font-flow text-flow-ink"
                  style={{ fontSize: s(28), lineHeight: s(44) }}
                >
                  {line}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ height: s(HEADING_TO_BUTTON_GAP) }} />
          <FlowButton
            label="選ぶ"
            loading={!worryCandidates}
            onPress={startPicking}
          />
        </Animated.View>

        {/* exitingを効かせるため、visible条件ではなくマウント自体を切り替える */}
        {confirming && selected ? (
          <WorryConfirmModal
            visible
            candidate={selected}
            bubbleIndex={selectedBubbleIndex}
            fontSize={bubbleFontSize}
            onConfirm={handleConfirm}
            onReselect={handleReselect}
          />
        ) : null}
      </View>
    </View>
  );
}
