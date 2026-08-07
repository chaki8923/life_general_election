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
import { FONT, useDesignScale } from "./layout";
import { ThoughtBubble } from "./thought-bubble";
import { WORRY_BUBBLE_COLORS } from "./worry-bubble-colors";
import type { WorrySuggestion } from "@/types";

const SHAPES = {
  orange: require("../../../assets/election/worry-bubble-orange.svg"),
  pink: require("../../../assets/election/worry-bubble-pink.svg"),
  green: require("../../../assets/election/worry-bubble-green.svg"),
  purple: require("../../../assets/election/worry-bubble-purple.svg"),
  blue: require("../../../assets/election/worry-bubble-blue.svg"),
} as const;

/**
 * Figma 916:14877 の吹き出し5枠。x,w,h はアートボード(390幅)基準、
 * y は CONTENT_TOP（ステッパー下端）を原点にした値。
 * textCenterX/Y は雲ごとに主ローブの位置が違うので個別に持つ。
 */
const SLOTS = [
  {
    shape: "orange",
    color: WORRY_BUBBLE_COLORS[0],
    x: 18,
    y: 75.706,
    w: 153.001,
    h: 135.9,
    textCenterX: 0.58,
    textCenterY: 0.41,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: false,
    quoted: false,
    hint: { x: 145, y: 52.706 },
  },
  {
    shape: "pink",
    color: WORRY_BUBBLE_COLORS[1],
    x: 229,
    y: 64.706,
    w: 151.47,
    h: 126,
    textCenterX: 0.58,
    textCenterY: 0.41,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: true,
    quoted: true,
    hint: null,
  },
  {
    shape: "green",
    color: WORRY_BUBBLE_COLORS[2],
    x: 112,
    y: 176.706,
    w: 170.833,
    h: 142.109,
    textCenterX: 0.55,
    textCenterY: 0.44,
    textWidthRatio: 0.62,
    textHeightRatio: 0.56,
    flipX: true,
    quoted: true,
    hint: { x: 72, y: 235.706 },
  },
  {
    shape: "purple",
    color: WORRY_BUBBLE_COLORS[3],
    x: 18,
    y: 311.706,
    w: 151.47,
    h: 126,
    textCenterX: 0.58,
    textCenterY: 0.41,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: false,
    quoted: true,
    hint: { x: 149, y: 353.706 },
  },
  {
    shape: "blue",
    color: WORRY_BUBBLE_COLORS[4],
    x: 206,
    y: 347.706,
    w: 151.469,
    h: 126,
    textCenterX: 0.58,
    textCenterY: 0.41,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: true,
    quoted: true,
    hint: { x: 336, y: 331.706 },
  },
] as const;

/** 全部ポップし終わってから「タッチ」を出すまでの待ち */
const HINT_DELAY_MS = SLOTS.length * 220 + 450;

/** Figma上の吹き出し文字サイズ（アートボード基準） */
const BUBBLE_FONT_SIZE = 16;

type BubbleFieldProps = {
  candidates: WorrySuggestion[];
  selectedId: string | null;
  onSelect: (candidate: WorrySuggestion) => void;
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
  selectedId,
  onSelect,
  originX,
  originY,
}: BubbleFieldProps) {
  const { s } = useDesignScale();

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      {SLOTS.map((slot, i) => {
        const candidate = candidates[i];
        if (!candidate) return null;
        const selected = candidate.id === selectedId;
        return (
          <ThoughtBubble
            key={candidate.id}
            label={candidate.label}
            index={i}
            selected={selected}
            source={SHAPES[slot.shape]}
            color={slot.color}
            quoted={slot.quoted}
            left={s(slot.x)}
            top={s(slot.y)}
            width={s(slot.w)}
            height={s(slot.h)}
            textCenterX={slot.textCenterX}
            textCenterY={slot.textCenterY}
            textWidthRatio={slot.textWidthRatio}
            textHeightRatio={slot.textHeightRatio}
            flipX={slot.flipX}
            fontSize={s(BUBBLE_FONT_SIZE)}
            originX={s(originX)}
            originY={s(originY)}
            onPress={() => onSelect(candidate)}
          />
        );
      })}

      {SLOTS.map((slot, i) =>
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
