import { View as RNView } from "react-native";
import { VerticalText } from "./vertical-text";

// RNには文字縁取り(text-stroke)がなく、textShadowも単発の「にじんだ影」に
// しかならないため、同一テキストを4方向にオフセットして重ねる疑似ストローク。
// 名前は最大8文字なのでTextノード数は問題にならない。
type Props = {
  text: string;
  fontSize: number;
  /** 中央(塗り)のクラス。例: text-white */
  fillClassName: string;
  /** 縁取り4枚のクラス。例: text-election-red-dark */
  strokeClassName: string;
};

export function StrokedVerticalText({
  text,
  fontSize,
  fillClassName,
  strokeClassName,
}: Props) {
  // px固定だと高解像度キャプチャ時に縁が細く見えるためフォントサイズに比例させる
  const offset = Math.max(1.5, fontSize * 0.06);
  const offsets: [number, number][] = [
    [-offset, 0],
    [offset, 0],
    [0, -offset],
    [0, offset],
  ];

  return (
    <RNView>
      {offsets.map(([dx, dy]) => (
        <RNView
          key={`${dx},${dy}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX: dx }, { translateY: dy }],
          }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <VerticalText
            text={text}
            fontSize={fontSize}
            className={`font-black ${strokeClassName}`}
          />
        </RNView>
      ))}
      {/* 中央コピーがラッパーのレイアウトサイズを決める */}
      <VerticalText
        text={text}
        fontSize={fontSize}
        className={`font-black ${fillClassName}`}
      />
    </RNView>
  );
}
