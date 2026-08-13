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

/** 未到達区間の点線。RNのborderStyle:dashedは端末差が大きいので短いViewを並べて描く */
function StepLine({ reached }: { reached: boolean }) {
  if (reached) {
    // Figma: 到達済みは main/pink の実線
    return <View className="h-0.5 flex-1 bg-flow-pink" />;
  }
  return (
    <View className="h-0.5 flex-1 flex-row items-center justify-between overflow-hidden">
      {Array.from({ length: 7 }, (_, i) => (
        <View key={i} className="h-0.5 w-1.5 rounded-full bg-[#d0d7de]" />
      ))}
    </View>
  );
}

/**
 * 選挙フロー共通の進捗バー
 * Figma(893:3409): w≈293 / ドット≈12px / ラベル8px Medium
 * 到達= #f4728a（ドット・ラベル・実線） / 未到達= #6e7781・薄いグレー点線
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
                className={`rounded-full ${
                  reached ? "bg-flow-pink" : "bg-[#d0d7de]"
                }`}
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              >
                {/* ラベルはドットより広いのでドット中心を基準に絶対配置する */}
                <Text
                  numberOfLines={1}
                  className={`absolute text-center text-[8px] font-flow-medium leading-[1.4] ${
                    reached ? "text-flow-pink" : "text-flow-ink-low"
                  }`}
                  style={{
                    top: DOT_SIZE + 2,
                    left: DOT_SIZE / 2 - LABEL_WIDTH / 2,
                    width: LABEL_WIDTH,
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
