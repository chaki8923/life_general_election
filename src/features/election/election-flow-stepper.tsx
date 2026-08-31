import { FlowStepper } from "@/components/ui/flow-stepper";
import { useDesignScale } from "@/features/election/layout";
import { useElectionStore } from "@/stores/election";
import { View } from "@/tw";
import type { StyleProp, ViewStyle } from "react-native";

type ElectionFlowStepperProps = {
  /** 0始まり: プロフ登録 → お悩み選択 → 投票結果 → 人生公約 */
  current: number;
  /** 未指定時は election store の showProfileStep を参照 */
  showProfileStep?: boolean;
  /** オンボーディングのプロフ登録など、常に4ステップ版を出す */
  alwaysShow?: boolean;
  /** 非表示時に result 画面相当の上余白だけ確保する */
  fallbackSpacer?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * 選挙フロー用の進捗バー。
 * プロフィール登録直後（showProfileStep）以外は非表示。
 */
export function ElectionFlowStepper({
  current,
  showProfileStep: showProfileStepProp,
  alwaysShow = false,
  fallbackSpacer = false,
  className,
  style,
}: ElectionFlowStepperProps) {
  const storeShowProfileStep = useElectionStore((s) => s.showProfileStep);
  const { s } = useDesignScale();
  const visible =
    alwaysShow || (showProfileStepProp ?? storeShowProfileStep);

  if (!visible) {
    if (fallbackSpacer) {
      return <View style={{ height: s(4) }} />;
    }
    return null;
  }

  return (
    <View className={className} style={style}>
      <FlowStepper current={current} showProfileStep />
    </View>
  );
}
