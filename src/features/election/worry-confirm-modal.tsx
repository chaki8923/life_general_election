import { FadeIn, FadeOut } from "react-native-reanimated";
import { FlowButton } from "@/components/ui/flow-button";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { WORRIES_BACKGROUND } from "@/constants/election-images";
import { useDesignScale } from "./layout";
import { WorryBubbleCloud } from "./worry-bubble-cloud";
import {
  BUBBLE_FONT_SIZE,
  getConfirmCloudRect,
  getWorryBubbleSlot,
} from "./worry-bubble-slots";
import type { WorrySuggestion } from "@/types";

const CONTENT_WIDTH = 302;
const HEADING_TOP = 80.706;
const BUTTONS_TOP = 381.706;

type WorryConfirmModalProps = {
  visible: boolean;
  candidate: WorrySuggestion | null;
  bubbleIndex: number;
  onConfirm: () => void;
  onReselect: () => void;
};

/** Figma 1700:7125。モーダルではなく、同じ画面内の確認フェーズとして表示する。 */
export function WorryConfirmModal({
  visible,
  candidate,
  bubbleIndex,
  onConfirm,
  onReselect,
}: WorryConfirmModalProps) {
  const { s } = useDesignScale();
  if (!visible || !candidate) return null;
  // 選んだ吹き出しをそのまま相似拡大する（形・向き・改行位置が選択前と揃う）
  const slot = getWorryBubbleSlot(bubbleIndex);
  const rect = getConfirmCloudRect(bubbleIndex);

  return (
    <Animated.View
      className="absolute inset-0 overflow-hidden bg-flow-bg"
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(180)}
    >
      <Image
        source={WORRIES_BACKGROUND}
        className="absolute inset-0"
        contentFit="fill"
        pointerEvents="none"
      />

      <Text
        className="text-center font-flow text-flow-ink"
        style={{
          position: "absolute",
          left: s((390 - CONTENT_WIDTH) / 2),
          top: s(HEADING_TOP),
          width: s(CONTENT_WIDTH),
          fontSize: s(16),
          lineHeight: s(24),
          letterSpacing: s(0.8),
        }}
      >
        この悩みをテーマ{"\n"}にしますか？
      </Text>

      <View
        style={{
          position: "absolute",
          left: s(rect.left),
          top: s(rect.top),
          width: s(rect.width),
          height: s(rect.height),
        }}
      >
        <WorryBubbleCloud
          label={candidate.label}
          slot={slot}
          width={s(rect.width)}
          height={s(rect.height)}
          // 幅と同じ倍率で拡大するので、改行位置が選択前の吹き出しと一致する
          fontSize={s(BUBBLE_FONT_SIZE * rect.scale)}
        />
      </View>

      <View
        style={{
          position: "absolute",
          left: s((390 - CONTENT_WIDTH) / 2),
          top: s(BUTTONS_TOP),
          width: s(CONTENT_WIDTH),
          gap: s(16),
        }}
      >
        <FlowButton label="はい！" onPress={onConfirm} />
        <FlowButton label="選び直す" variant="dashed" onPress={onReselect} />
      </View>
    </Animated.View>
  );
}
