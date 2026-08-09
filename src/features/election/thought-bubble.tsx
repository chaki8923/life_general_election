import { useEffect, useRef } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Pressable } from "@/tw";
import { Animated } from "@/tw/animated";
import { WorryBubbleCloud } from "./worry-bubble-cloud";
import type { WorryBubbleSlot } from "./worry-bubble-slots";

/** 1つ前の吹き出しが弾んでいる途中に次が出る間隔（candidate-cardの250msに揃える） */
const STAGGER_MS = 220;

/** 選択されなかった吹き出しが左右へ捌けるまで */
const SCATTER_STAGGER_MS = 40;
const SCATTER_MS = 380;
/** 捌けはじめを少し見せてから、選ばれた吹き出しが中央へ寄る */
const FOCUS_DELAY_MS = 120;
const FOCUS_MS = 420;

type ThoughtBubbleProps = {
  label: string;
  /** 0始まり。ポップの遅延に使う */
  index: number;
  selected: boolean;
  /** 形・色・向き・文字領域の比率をまとめて持つ枠定義 */
  slot: WorryBubbleSlot;
  /** 最終位置・実寸（実機px） */
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  /** 飛び出す起点＝脳の中心（画面座標・実機px） */
  originX: number;
  originY: number;
  /** 他が選ばれたので画面外へ捌ける */
  scatter: boolean;
  /** 捌ける先のオフセット（実機px・符号付き）と傾き（deg） */
  scatterX: number;
  scatterY: number;
  scatterRotate: number;
  /** 自分が選ばれたので確認画面の雲の位置へ寄る */
  focus: boolean;
  /** 確認画面の雲の中心までの移動量（実機px）と拡大率 */
  focusX: number;
  focusY: number;
  focusScale: number;
  /** 中央への移動が終わった通知（選ばれた吹き出しだけ渡される） */
  onFocusEnd?: () => void;
  onPress: () => void;
};

/** 脳から飛び出して定位置でポコッと弾む思考の吹き出し（Figma 916:14877） */
export function ThoughtBubble({
  label,
  index,
  selected,
  slot,
  left,
  top,
  width,
  height,
  fontSize,
  originX,
  originY,
  scatter,
  scatterX,
  scatterY,
  scatterRotate,
  focus,
  focusX,
  focusY,
  focusScale,
  onFocusEnd,
  onPress,
}: ThoughtBubbleProps) {
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(0);
  const scatterProgress = useSharedValue(0);
  const focusProgress = useSharedValue(0);

  // 依存配列に入れて再生し直さないよう、最新のコールバックだけ差し替える
  const focusEndRef = useRef(onFocusEnd);
  focusEndRef.current = onFocusEnd;

  useEffect(() => {
    if (reduceMotion) {
      pop.value = 1;
      return;
    }
    pop.value = withDelay(
      index * STAGGER_MS,
      // オーバーシュートするばねの戻りがそのまま「ポコッ」になる
      withSpring(1, { damping: 9, stiffness: 170, mass: 0.8 })
    );
  }, [pop, index, reduceMotion]);

  // 選び直しでscatter/focusがfalseに戻ると、そのまま逆再生で定位置へ帰る
  useEffect(() => {
    const to = scatter ? 1 : 0;
    if (reduceMotion) {
      scatterProgress.value = to;
      return;
    }
    scatterProgress.value = withDelay(
      index * SCATTER_STAGGER_MS,
      withTiming(to, {
        duration: SCATTER_MS,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [scatter, index, reduceMotion, scatterProgress]);

  useEffect(() => {
    const notifyEnd = () => focusEndRef.current?.();
    if (reduceMotion) {
      focusProgress.value = focus ? 1 : 0;
      if (focus) notifyEnd();
      return;
    }
    focusProgress.value = withDelay(
      focus ? FOCUS_DELAY_MS : 0,
      withTiming(
        focus ? 1 : 0,
        { duration: FOCUS_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          "worklet";
          if (finished && focus) runOnJS(notifyEnd)();
        }
      )
    );
  }, [focus, reduceMotion, focusProgress]);

  // p=0 のとき中心が脳の位置、p=1 で定位置に着く
  const fromX = originX - (left + width / 2);
  const fromY = originY - (top + height / 2);

  const popStyle = useAnimatedStyle(() => {
    const p = pop.value;
    const e = scatterProgress.value;
    const f = focusProgress.value;
    return {
      opacity: (p <= 0 ? 0 : 1) * (1 - e),
      transform: [
        { translateX: fromX * (1 - p) + scatterX * e + focusX * f },
        { translateY: fromY * (1 - p) + scatterY * e + focusY * f },
        { rotate: `${scatterRotate * e}deg` },
        { scale: p * (1 - 0.12 * e) * (1 + (focusScale - 1) * f) },
      ],
    };
  });

  return (
    <Animated.View
      // 捌けている最中／中央へ移動中は連打を受け付けない
      pointerEvents={scatter || focus ? "none" : "auto"}
      style={[{ position: "absolute", left, top, width, height }, popStyle]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={{ width, height }}
      >
        <WorryBubbleCloud
          label={label}
          slot={slot}
          width={width}
          height={height}
          fontSize={fontSize}
        />
      </Pressable>
    </Animated.View>
  );
}
