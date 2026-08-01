import { Modal, useWindowDimensions } from "react-native";
import { FlowButton } from "@/components/ui/flow-button";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { FONT } from "./layout";
import type { WorrySuggestion } from "@/types";

/** Figmaのbubble-d（170.834×142.109）の縦横比 */
const CLOUD_ASPECT = 142.109 / 170.834;
/** モーダルの内寸いっぱいまで広げるが、ここが上限 */
const CLOUD_MAX_WIDTH = 280;
/** 吹き出しの実寸を出すためのモーダル寸法（max-w-[350px] / px-5 / p-6 と対応） */
const MODAL_MAX_WIDTH = 350;
const MODAL_MARGIN = 20 * 2;
const MODAL_PADDING = 24 * 2;

/** 雲形のくびれを避けて文字を置ける範囲（吹き出し実寸に対する比率） */
const TEXT_CENTER_X = 0.55;
const TEXT_CENTER_Y = 0.46;
const TEXT_WIDTH_RATIO = 0.72;
const TEXT_HEIGHT_RATIO = 0.44;

const FONT_SIZE_MAX = 20;
const FONT_SIZE_MIN = 13;

/**
 * 全角1文字＝1emとみなして、2行に収まる文字サイズを求める。
 * 収まらない長さでも3行目に1文字だけ落ちる不自然な改行を避けるため、
 * adjustsFontSizeToFit任せにせず先にサイズを決める。
 */
function fitFontSize(text: string, boxWidth: number): number {
  if (!text) return FONT_SIZE_MAX;
  const charsPerLine = Math.ceil(text.length / 2);
  const fitted = Math.floor(boxWidth / charsPerLine);
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fitted));
}

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
  const { width } = useWindowDimensions();
  const cloudWidth = Math.min(
    Math.min(width - MODAL_MARGIN, MODAL_MAX_WIDTH) - MODAL_PADDING,
    CLOUD_MAX_WIDTH
  );
  const cloudHeight = cloudWidth * CLOUD_ASPECT;
  const textWidth = cloudWidth * TEXT_WIDTH_RATIO;
  const label = candidate ? `『${candidate.label}』` : "";
  const fontSize = fitFontSize(label, textWidth);

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
            この悩みを{"\n"}テーマにしますか？
          </Text>

          <View style={{ width: cloudWidth, height: cloudHeight }}>
            <Image
              source={require("../../../assets/election/bubble-d-active.svg")}
              style={{ width: cloudWidth, height: cloudHeight }}
              contentFit="contain"
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: cloudWidth * TEXT_CENTER_X - textWidth / 2,
                top: cloudHeight * (TEXT_CENTER_Y - TEXT_HEIGHT_RATIO / 2),
                width: textWidth,
                height: cloudHeight * TEXT_HEIGHT_RATIO,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  textAlign: "center",
                  fontFamily: FONT.bold,
                  fontSize,
                  lineHeight: fontSize * 1.35,
                  color: "#ffffff",
                }}
              >
                {label}
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
