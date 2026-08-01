import { useEffect } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { Pressable, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { FONT } from "./layout";

/** 1つ前の吹き出しが弾んでいる途中に次が出る間隔（candidate-cardの250msに揃える） */
const STAGGER_MS = 220;

type ThoughtBubbleProps = {
  label: string;
  /** 0始まり。ポップの遅延に使う */
  index: number;
  selected: boolean;
  source: ImageSourcePropType;
  /** 最終位置・実寸（実機px） */
  left: number;
  top: number;
  width: number;
  height: number;
  /** 雲の主ローブの中心（吹き出しサイズに対する比率） */
  textCenterX: number;
  textCenterY: number;
  /** 雲の輪郭内に収める文字領域（吹き出しサイズに対する比率） */
  textWidthRatio: number;
  textHeightRatio: number;
  /** 吹き出し画像だけを水平反転し、文字の向きは保つ */
  flipX: boolean;
  fontSize: number;
  /** 飛び出す起点＝脳の中心（画面座標・実機px） */
  originX: number;
  originY: number;
  onPress: () => void;
};

/** 脳から飛び出して定位置でポコッと弾む思考の吹き出し（Figma 916:14877） */
export function ThoughtBubble({
  label,
  index,
  selected,
  source,
  left,
  top,
  width,
  height,
  textCenterX,
  textCenterY,
  textWidthRatio,
  textHeightRatio,
  flipX,
  fontSize,
  originX,
  originY,
  onPress,
}: ThoughtBubbleProps) {
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      pop.value = 1;
      return;
    }
    pop.value = withDelay(
      index * STAGGER_MS,
      // オーバーシュートするばねの戻りがそのまま「ポコッ」になる
      withSpring(1, { damping: 9, stiffness: 170, mass: 0.8 })
    );
  }, [pop, index, reduceMotion]);

  // p=0 のとき中心が脳の位置、p=1 で定位置に着く
  const fromX = originX - (left + width / 2);
  const fromY = originY - (top + height / 2);

  const popStyle = useAnimatedStyle(() => {
    const p = pop.value;
    return {
      opacity: p <= 0 ? 0 : 1,
      transform: [
        { translateX: fromX * (1 - p) },
        { translateY: fromY * (1 - p) },
        { scale: p },
      ],
    };
  });

  const displayLabel = selected ? `『${label}』` : label;
  const labelLength = [...displayLabel].length;
  // adjustsFontSizeToFitだけに頼らず、長さに応じて初期サイズから確実に下げる
  const lengthScale = labelLength > 20 ? 0.78 : labelLength > 16 ? 0.86 : labelLength > 12 ? 0.92 : 1;
  // 反転後はローブの安全領域が狭くなるため、少し余白を増やす
  const fittedFontSize = fontSize * lengthScale * (flipX ? 0.94 : 1);
  const textWidth = width * textWidthRatio;
  const textHeight = height * textHeightRatio;
  const effectiveTextCenterX = flipX ? 1 - textCenterX : textCenterX;

  return (
    <Animated.View
      style={[{ position: "absolute", left, top, width, height }, popStyle]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={{ width, height }}
      >
        <Image
          source={source}
          style={{
            width,
            height,
            transform: [{ scaleX: flipX ? -1 : 1 }],
          }}
          contentFit="contain"
          pointerEvents="none"
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: width * effectiveTextCenterX - textWidth / 2,
            top: height * textCenterY - textHeight / 2,
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
              color: selected ? "#ffffff" : "#24292f",
            }}
          >
            {displayLabel}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
