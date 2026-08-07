import { FlowButton } from "@/components/ui/flow-button";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { FONT, useDesignScale } from "./layout";
import { getWorryBubbleColor } from "./worry-bubble-colors";
import type { WorrySuggestion } from "@/types";

const CONTENT_WIDTH = 302;
const HEADING_TOP = 80.706;
const CLOUD_TOP = 154.706;
const CLOUD_WIDTH = 242;
const CLOUD_HEIGHT = 201;
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
  const bubbleColor = getWorryBubbleColor(bubbleIndex);

  return (
    <View className="absolute inset-0 overflow-hidden bg-flow-bg">
      <Image
        source={require("../../../assets/election/worries-bg.png")}
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
          left: s((390 - CLOUD_WIDTH) / 2),
          top: s(CLOUD_TOP),
          width: s(CLOUD_WIDTH),
          height: s(CLOUD_HEIGHT),
        }}
      >
        <Image
          source={require("../../../assets/election/worry-bubble-pink.svg")}
          style={{
            width: "100%",
            height: "100%",
            tintColor: bubbleColor,
          }}
          contentFit="fill"
          pointerEvents="none"
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: s(31),
            top: s(39),
            width: s(180),
            height: s(108),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            style={{
              textAlign: "center",
              fontFamily: FONT.bold,
              fontSize: s(24),
              lineHeight: s(36),
              letterSpacing: s(1.2),
              color: "#ffffff",
            }}
          >
            『{candidate.label}』
          </Text>
        </View>
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
    </View>
  );
}
