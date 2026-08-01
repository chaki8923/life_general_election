import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "@/tw";
import { FONT } from "@/features/election/layout";

/**
 * カウント全体のうち ratio（0..1）に到達する時刻の比率を返す。
 * Odometerは一定速度でカウントするため、時間と得票率は同じ比率になる。
 * 「数字が○○を超えたら文言を変える」を外側でタイマー化するために公開している。
 */
export function odometerTimeAtRatio(ratio: number): number {
  return Math.min(Math.max(ratio, 0), 1);
}

type OdometerProps = {
  /** 最終的に表示する数値 */
  value: number;
  /** 桁数。省略時は value の桁数 */
  digits?: number;
  durationMs?: number;
  fontSize: number;
  /** 1桁ぶんの縦送り量（＝行の高さ）。省略時は fontSize の0.92倍 */
  rowHeight?: number;
  color?: string;
  fontFamily?: string;
  letterSpacing?: number;
  /** カウント完了時に一度だけ呼ばれる */
  onComplete?: () => void;
};

type DigitColumnProps = {
  digit: string;
  visible: boolean;
  fontSize: number;
  rowHeight: number;
  color: string;
  fontFamily: string;
  letterSpacing: number;
};

function DigitColumn({
  digit,
  visible,
  fontSize,
  rowHeight,
  color,
  fontFamily,
  letterSpacing,
}: DigitColumnProps) {
  return (
    <View
      style={{
        height: rowHeight,
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
      }}
    >
      <Text
        style={{
          fontSize,
          fontFamily,
          color,
          letterSpacing,
          lineHeight: rowHeight,
          fontVariant: ["tabular-nums"],
        }}
      >
        {digit}
      </Text>
    </View>
  );
}

/**
 * Reanimatedの進行値を正しい整数に変換して表示するカウンタ。
 * 先頭ゼロの幅は保ちつつ、表示上は非表示にする。
 */
export function Odometer({
  value,
  digits,
  durationMs = 1200,
  fontSize,
  rowHeight,
  color = "#ffffff",
  fontFamily = FONT.counter,
  letterSpacing = 0,
  onComplete,
}: OdometerProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const notifyComplete = useCallback(() => {
    setDisplayValue(value);
    onCompleteRef.current?.();
  }, [value]);

  useAnimatedReaction(
    () => Math.min(Math.floor(Math.max(progress.value, 0)), value),
    (current, previous) => {
      if (current !== previous) runOnJS(setDisplayValue)(current);
    },
    [value]
  );

  useEffect(() => {
    if (reduceMotion) {
      progress.value = value;
      setDisplayValue(value);
      notifyComplete();
      return;
    }
    setDisplayValue(0);
    progress.value = 0;
    progress.value = withTiming(
      value,
      { duration: durationMs, easing: Easing.linear },
      (finished) => {
        "worklet";
        if (finished) runOnJS(notifyComplete)();
      }
    );
  }, [value, durationMs, reduceMotion, progress, notifyComplete]);

  const step = rowHeight ?? Math.round(fontSize * 0.92);
  const places = digits ?? String(Math.max(Math.floor(value), 0)).length;
  const safeDisplayValue = Math.max(Math.floor(displayValue), 0);
  const displayDigits = String(safeDisplayValue)
    .padStart(places, "0")
    .slice(-places)
    .split("");

  return (
    <View className="flex-row" accessibilityLabel={String(safeDisplayValue)}>
      {displayDigits.map((digit, i) => {
        const place = places - 1 - i;
        return (
          <DigitColumn
            key={place}
            digit={digit}
            visible={place === 0 || safeDisplayValue >= 10 ** place}
            fontSize={fontSize}
            rowHeight={step}
            color={color}
            fontFamily={fontFamily}
            letterSpacing={letterSpacing}
          />
        );
      })}
    </View>
  );
}
