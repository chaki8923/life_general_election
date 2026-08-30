import { useEffect } from "react";
import {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { View } from "@/tw";
import { Animated } from "@/tw/animated";
import { DESIGN_WIDTH, FONT, useDesignScale } from "./layout";
import { ThoughtBubble } from "./thought-bubble";
import {
  CONFIRM_CENTER_Y,
  WORRY_BUBBLE_SLOTS,
  getConfirmCloudRect,
} from "./worry-bubble-slots";
import type { WorrySuggestion } from "@/types";

/** 全部ポップし終わってから「タッチ」を出すまでの待ち */
const HINT_DELAY_MS = WORRY_BUBBLE_SLOTS.length * 220 + 450;

/** 選ばれた吹き出しが向かう先＝確認画面の雲の中心（アートボード座標） */
const CONFIRM_CENTER_X = DESIGN_WIDTH / 2;

type BubbleFieldProps = {
  candidates: WorrySuggestion[];
  /** 5枚で共通の文字サイズ（アートボード基準）。fitBubbleFontSize() の結果 */
  fontSize: number;
  selectedId: string | null;
  onSelect: (candidate: WorrySuggestion) => void;
  /** 選ばれた吹き出しが確認画面の位置に着いた通知 */
  onFocusEnd: () => void;
  /** 吹き出しが飛び出す起点＝脳の中心（アートボード座標） */
  originX: number;
  originY: number;
};

type TouchHintProps = {
  left: number;
  top: number;
  fontSize: number;
  lineHeight: number;
  index: number;
  hidden: boolean;
};

/** 各「タッチ」が別々のタイミングと周期でふわっと明滅する */
function TouchHint({
  left,
  top,
  fontSize,
  lineHeight,
  index,
  hidden,
}: TouchHintProps) {
  const reduceMotion = useReducedMotion();
  const visibility = useSharedValue(0);
  const duration = 760 + (index % 3) * 130;
  const distance = fontSize * (0.45 + (index % 2) * 0.12);

  useEffect(() => {
    cancelAnimation(visibility);
    if (hidden) {
      visibility.value = withTiming(0, { duration: 150 });
      return;
    }
    if (reduceMotion) {
      visibility.value = 1;
      return;
    }
    visibility.value = withDelay(
      HINT_DELAY_MS + index * 170,
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0, { duration })
        ),
        -1
      )
    );
  }, [duration, hidden, index, reduceMotion, visibility]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [{ translateY: distance * (1 - 2 * visibility.value) }],
  }));

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left,
          top,
          fontFamily: FONT.bold,
          fontSize,
          lineHeight,
          color: "#24292f",
        },
        animatedStyle,
      ]}
    >
      タッチ
    </Animated.Text>
  );
}

/** 悩み候補5件を雲の吹き出しとして配置し、1つずつポコポコ出す */
export function BubbleField({
  candidates,
  fontSize,
  selectedId,
  onSelect,
  onFocusEnd,
  originX,
  originY,
}: BubbleFieldProps) {
  const { s } = useDesignScale();

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      {WORRY_BUBBLE_SLOTS.map((slot, i) => {
        const candidate = candidates[i];
        if (!candidate) return null;
        const selected = candidate.id === selectedId;
        const centerX = slot.x + slot.w / 2;
        const centerY = slot.y + slot.h / 2;
        // アートボード中央より左の雲は左へ、右の雲は右へ抜ける
        const dir = centerX < DESIGN_WIDTH / 2 ? -1 : 1;
        return (
          <ThoughtBubble
            key={candidate.id}
            scatter={selectedId !== null && !selected}
            scatterX={s(dir * (DESIGN_WIDTH / 2 + slot.w))}
            scatterY={s(i % 2 === 0 ? -22 : 18)}
            scatterRotate={dir * 10}
            focus={selected}
            focusX={s(CONFIRM_CENTER_X - centerX)}
            focusY={s(CONFIRM_CENTER_Y - centerY)}
            // 確認画面の雲は同じ形の相似拡大なので、その倍率まで拡大すれば継ぎ目がない
            focusScale={getConfirmCloudRect(i).scale}
            onFocusEnd={selected ? onFocusEnd : undefined}
            label={candidate.label}
            index={i}
            selected={selected}
            slot={slot}
            left={s(slot.x)}
            top={s(slot.y)}
            width={s(slot.w)}
            height={s(slot.h)}
            fontSize={s(fontSize)}
            originX={s(originX)}
            originY={s(originY)}
            onPress={() => onSelect(candidate)}
          />
        );
      })}

      {WORRY_BUBBLE_SLOTS.map((slot, i) =>
        slot.hint && candidates[i] ? (
          <TouchHint
            key={`hint-${i}`}
            left={s(slot.hint.x)}
            top={s(slot.hint.y)}
            fontSize={s(8)}
            lineHeight={s(12)}
            index={i}
            hidden={selectedId !== null}
          />
        ) : null
      )}
    </View>
  );
}
