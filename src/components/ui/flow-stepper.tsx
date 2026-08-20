import { Fragment } from "react";
import { Text, View } from "@/tw";

/** Figma: プロフ登録 → お悩み選択 → 投票結果 → 人生公約を登録 */
const ALL_STEPS = [
  "プロフ登録",
  "お悩み選択",
  "投票結果",
  "人生公約を登録",
] as const;

const DOT_SIZE = 12;
/** 最長ラベル「人生公約を登録」向け。短いラベルも中央揃えで同じ幅 */
const LABEL_WIDTH = 72;

type FlowStepperProps = {
  /** 0始まりの現在ステップ（0..3） */
  current: number;
  /** プロフィール登録直後のフローだけ先頭ステップを表示する */
  showProfileStep?: boolean;
};

/** 到達済み: 黒系インク / 未到達: 薄いグレー */
const COLOR_REACHED_DOT = "#24292f";
const COLOR_REACHED_LINE = "#424a53";
const COLOR_REACHED_LABEL = "#24292f";
const COLOR_UNREACHED_DOT = "#d0d7de";
const COLOR_UNREACHED_LINE = "#d0d7de";
const COLOR_UNREACHED_LABEL = "#6e7781";

/** 未到達区間の点線。RNのborderStyle:dashedは端末差が大きいので短いViewを並べて描く */
function StepLine({ reached }: { reached: boolean }) {
  if (reached) {
    return (
      <View
        className="h-0.5 flex-1"
        style={{ backgroundColor: COLOR_REACHED_LINE }}
      />
    );
  }
  return (
    <View className="h-0.5 flex-1 flex-row items-center justify-between overflow-hidden">
      {Array.from({ length: 7 }, (_, i) => (
        <View
          key={i}
          className="h-0.5 w-1.5 rounded-full"
          style={{ backgroundColor: COLOR_UNREACHED_LINE }}
        />
      ))}
    </View>
  );
}

/**
 * 選挙フロー共通の進捗バー
 * Figma(893:3409): w≈293 / ドット≈12px / ラベル8px Medium
 * 到達= 黒系インク（ドット・ラベル・実線） / 未到達= 薄いグレー点線
 */
export function FlowStepper({
  current,
  showProfileStep = false,
}: FlowStepperProps) {
  const steps = showProfileStep ? ALL_STEPS : ALL_STEPS.slice(1);
  const displayCurrent = showProfileStep ? current : Math.max(0, current - 1);

  return (
    <View className="h-[41px] w-[293px] self-center">
      <View className="h-3 flex-row items-center">
        {steps.map((label, i) => {
          const reached = i <= displayCurrent;
          return (
            <Fragment key={label}>
              {i > 0 ? <StepLine reached={reached} /> : null}
              <View
                className="rounded-full"
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  backgroundColor: reached
                    ? COLOR_REACHED_DOT
                    : COLOR_UNREACHED_DOT,
                }}
              >
                {/* ラベルはドットより広いのでドット中心を基準に絶対配置する */}
                <Text
                  numberOfLines={1}
                  className="absolute text-center text-[8px] font-flow-medium leading-[1.4]"
                  style={{
                    top: DOT_SIZE + 2,
                    left: DOT_SIZE / 2 - LABEL_WIDTH / 2,
                    width: LABEL_WIDTH,
                    color: reached
                      ? COLOR_REACHED_LABEL
                      : COLOR_UNREACHED_LABEL,
                  }}
                >
                  {label}
                </Text>
              </View>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
