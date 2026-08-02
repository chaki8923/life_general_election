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
const LABEL_WIDTH = 80;

type FlowStepperProps = {
  /** 0始まりの現在ステップ（0..3） */
  current: number;
  /** プロフィール登録直後のフローだけ先頭ステップを表示する */
  showProfileStep?: boolean;
};

/** 未到達区間の点線。RNのborderStyle:dashedは端末差が大きいので短いViewを並べて描く */
function StepLine({ reached }: { reached: boolean }) {
  if (reached) {
    return <View className="h-0.5 flex-1 bg-flow-dark" />;
  }
  return (
    <View className="h-0.5 flex-1 flex-row items-center justify-between overflow-hidden">
      {Array.from({ length: 7 }, (_, i) => (
        <View key={i} className="h-0.5 w-1.5 rounded-full bg-flow-ink-low" />
      ))}
    </View>
  );
}

/** 選挙フロー共通の進捗バー（Figma: w=293 / ドット12px / ラベル8px） */
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
                  reached ? "bg-flow-dark" : "bg-flow-ink-low"
                }`}
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              >
                {/* ラベルはドットより広いのでドット中心を基準に絶対配置する */}
                <Text
                  numberOfLines={1}
                  className={`absolute text-center text-[8px] font-flow-medium ${
                    reached ? "text-flow-ink-mid" : "text-flow-ink-low"
                  }`}
                  style={{
                    top: DOT_SIZE + 5,
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
