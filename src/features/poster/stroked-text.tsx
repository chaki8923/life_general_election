import type { ReactNode } from "react";
import { View as RNView } from "react-native";

// RNには文字縁取り(text-stroke)がなく、textShadowも単発の「にじんだ影」に
// しかならないため、同一テキストを4方向にオフセットして重ねる疑似ストローク。
type Props = {
  /** オフセット量の基準。フォントサイズを渡す */
  fontSize: number;
  fillColor: string;
  strokeColor: string;
  /** 色を受け取って中身を描く。塗り1枚＋縁取り4枚で呼ばれる */
  render: (color: string) => ReactNode;
};

export function Stroked({ fontSize, fillColor, strokeColor, render }: Props) {
  // px固定だと高解像度キャプチャ時に縁が細く見えるためフォントサイズに比例させる
  // （Figma実測: 40pxの文字に対して約3px = 0.075）
  const offset = Math.max(1.5, fontSize * 0.075);
  // 上下左右だけだと斜め方向の角が欠けるので8方向に置く。
  // 斜めは対角線が長くなるぶん縮めて縁の太さを揃える
  const diagonal = offset * 0.7071;
  const offsets: [number, number][] = [
    [-offset, 0],
    [offset, 0],
    [0, -offset],
    [0, offset],
    [-diagonal, -diagonal],
    [diagonal, -diagonal],
    [-diagonal, diagonal],
    [diagonal, diagonal],
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
          {render(strokeColor)}
        </RNView>
      ))}
      {/* 塗りのコピーがラッパーのレイアウトサイズを決める */}
      {render(fillColor)}
    </RNView>
  );
}
