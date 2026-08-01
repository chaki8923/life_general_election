import { Modal } from "react-native";
import { FlowButton } from "@/components/ui/flow-button";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { FONT } from "./layout";
import type { WorrySuggestion } from "@/types";

/** Figmaのbubble-d（170.834×142.109）をモーダル幅に合わせた実寸 */
const CLOUD_WIDTH = 224;
const CLOUD_HEIGHT = 186;
const TEXT_CENTER_X = 0.49;
const TEXT_CENTER_Y = 0.44;

type WorryConfirmModalProps = {
  visible: boolean;
  candidate: WorrySuggestion | null;
  onConfirm: () => void;
  /** 「選び直す」= 閉じて選択解除 */
  onReselect: () => void;
};

/** 選んだ悩みをテーマにするか確認するモーダル（Figma 916:15269） */
export function WorryConfirmModal({
  visible,
  candidate,
  onConfirm,
  onReselect,
}: WorryConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReselect}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="w-full max-w-[350px] items-center gap-[26px] rounded-xl bg-white p-6">
          <Text className="text-center font-flow text-base leading-6 tracking-[0.8px] text-flow-ink">
            この悩みをテーマ{"\n"}にしますか？
          </Text>

          <View style={{ width: CLOUD_WIDTH, height: CLOUD_HEIGHT }}>
            <Image
              source={require("../../../assets/election/bubble-d-active.svg")}
              style={{ width: CLOUD_WIDTH, height: CLOUD_HEIGHT }}
              contentFit="contain"
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: CLOUD_WIDTH * TEXT_CENTER_X - (CLOUD_WIDTH * 0.7) / 2,
                top: CLOUD_HEIGHT * TEXT_CENTER_Y - (CLOUD_HEIGHT * 0.52) / 2,
                width: CLOUD_WIDTH * 0.7,
                height: CLOUD_HEIGHT * 0.52,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={3}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{
                  textAlign: "center",
                  fontFamily: FONT.bold,
                  fontSize: 20,
                  lineHeight: 27,
                  color: "#ffffff",
                }}
              >
                {candidate ? `『${candidate.label}』` : ""}
              </Text>
            </View>
          </View>

          <View className="w-full gap-4">
            <FlowButton label="はい！" onPress={onConfirm} />
            <FlowButton
              label="選び直す"
              variant="dashed"
              onPress={onReselect}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
