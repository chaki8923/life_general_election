import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { FONT } from "./layout";
import { WORRY_BUBBLE_SHAPES } from "./worry-bubble-slots";
import type { WorryBubbleSlot } from "./worry-bubble-slots";

type WorryBubbleCloudProps = {
  label: string;
  slot: WorryBubbleSlot;
  /** 実機px。fontSizeはwidthと同じ倍率で渡すこと（改行位置を揃えるため） */
  width: number;
  height: number;
  fontSize: number;
};

/**
 * 雲の吹き出しとその中の文字。吹き出し一覧（ThoughtBubble）と確認画面（WorryConfirmModal）が
 * 同じ改行・同じ文字位置になるよう、描画はここに一本化している。
 */
export function WorryBubbleCloud({
  label,
  slot,
  width,
  height,
  fontSize,
}: WorryBubbleCloudProps) {
  const displayLabel = label;
  const labelLength = [...displayLabel].length;
  // adjustsFontSizeToFitだけに頼らず、長さに応じて初期サイズから確実に下げる
  const lengthScale =
    labelLength > 20 ? 0.78 : labelLength > 16 ? 0.86 : labelLength > 12 ? 0.92 : 1;
  // 反転後はローブの安全領域が狭くなるため、少し余白を増やす
  const fittedFontSize = fontSize * lengthScale * (slot.flipX ? 0.94 : 1);
  const textWidth = width * slot.textWidthRatio;
  const textHeight = height * slot.textHeightRatio;
  const effectiveTextCenterX = slot.flipX
    ? 1 - slot.textCenterX
    : slot.textCenterX;

  return (
    <>
      <Image
        source={WORRY_BUBBLE_SHAPES[slot.shape]}
        style={{
          width,
          height,
          tintColor: slot.color,
          transform: [{ scaleX: slot.flipX ? -1 : 1 }],
        }}
        contentFit="contain"
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: width * effectiveTextCenterX - textWidth / 2,
          top: height * slot.textCenterY - textHeight / 2,
          width: textWidth,
          height: textHeight,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Text
          numberOfLines={4}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          maxFontSizeMultiplier={1}
          ellipsizeMode="tail"
          style={{
            textAlign: "center",
            fontFamily: FONT.bold,
            fontSize: fittedFontSize,
            lineHeight: fittedFontSize * 1.32,
            color: "#ffffff",
          }}
        >
          {displayLabel}
        </Text>
      </View>
    </>
  );
}
