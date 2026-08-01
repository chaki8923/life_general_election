import { useWindowDimensions } from "react-native";

/** Figmaアートボード（iPhone 390×844）。座標・サイズはすべてこの基準で持つ */
export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;

/** 選挙フローで使うフォントファミリ（src/app/_layout.tsx の useFonts と同じキー） */
export const FONT = {
  bold: "NotoSansJP_700Bold",
  medium: "NotoSansJP_500Medium",
  counter: "font42dotSans_700Bold",
  counterRegular: "font42dotSans_400Regular",
} as const;

/**
 * ヘッダー(42)＋ステッパー(41.29)ブロックの下端のFigma上のy座標。
 * この下の絶対配置レイアウトは、ここを原点0として座標を持つ（実機のsafe areaに追従させるため）。
 */
export const CONTENT_TOP = 154.294;

/**
 * Figmaの絶対座標レイアウト（脳・吹き出し・スライダー）を実機幅に合わせて縮尺するヘルパ。
 * 高さ方向も同じ倍率を使う（縦横比を崩さないため）。
 */
export function useDesignScale() {
  const { width, height } = useWindowDimensions();
  const scale = width / DESIGN_WIDTH;
  return {
    width,
    height,
    scale,
    /** Figmaのpx値を実機pxに変換する */
    s: (value: number) => value * scale,
  };
}
