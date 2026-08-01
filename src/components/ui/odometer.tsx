import { useCallback, useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text, View } from "@/tw";
import { FONT } from "@/features/election/layout";

/** slowFrom 指定時、失速区間に充てる時間の既定割合 */
const DEFAULT_SLOW_TIME_RATIO = 0.25;

/**
 * カウント全体のうち value に到達する時刻の比率（0..1）を返す。
 * slowFrom までは等速、そこから先は Easing.out(quad) で失速する。
 * 「数字が○○を超えたら文言を変える」を外側でタイマー化するために公開している。
 */
export function odometerTimeAtValue(
  value: number,
  target: number,
  {
    slowFrom,
    slowTimeRatio = DEFAULT_SLOW_TIME_RATIO,
  }: { slowFrom?: number; slowTimeRatio?: number } = {}
): number {
  if (target <= 0) return 0;
  const current = Math.min(Math.max(value, 0), target);
  if (slowFrom === undefined || slowFrom <= 0 || slowFrom >= target) {
    return current / target;
  }
  const fastTimeRatio = 1 - slowTimeRatio;
  if (current <= slowFrom) return (current / slowFrom) * fastTimeRatio;
  // 減速区間は進捗 p = 1-(1-t)^2 なので、その逆関数で時刻を求める
  const p = (current - slowFrom) / (target - slowFrom);
  return fastTimeRatio + slowTimeRatio * (1 - Math.sqrt(1 - p));
}

type OdometerProps = {
  /** 最終的に表示する数値 */
  value: number;
  /** 桁数。省略時は value の桁数 */
  digits?: number;
  durationMs?: number;
  /** この数値を超えたら失速させる。省略時は最後まで等速 */
  slowFrom?: number;
  /** durationMs のうち失速区間に充てる割合 */
  slowTimeRatio?: number;
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
  slowFrom,
  slowTimeRatio = DEFAULT_SLOW_TIME_RATIO,
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
    if (slowFrom === undefined || slowFrom <= 0 || slowFrom >= value) {
      progress.value = withTiming(
        value,
        { duration: durationMs, easing: Easing.linear },
        (finished) => {
          "worklet";
          if (finished) runOnJS(notifyComplete)();
        }
      );
      return;
    }
    // slowFrom までは等速で駆け上がり、残りをじっくり見せる
    const slowMs = durationMs * slowTimeRatio;
    progress.value = withSequence(
      withTiming(slowFrom, {
        duration: durationMs - slowMs,
        easing: Easing.linear,
      }),
      withTiming(
        value,
        { duration: slowMs, easing: Easing.out(Easing.quad) },
        (finished) => {
          "worklet";
          if (finished) runOnJS(notifyComplete)();
        }
      )
    );
  }, [
    value,
    durationMs,
    slowFrom,
    slowTimeRatio,
    reduceMotion,
    progress,
    notifyComplete,
  ]);

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
