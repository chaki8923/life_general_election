import type { PosterPaletteId } from "@/types";

/** ポスターカードの比率（Figma 2040:6126 Avatar-Frame 350×400） */
export const POSTER_WIDTH = 350;
export const POSTER_HEIGHT = 400;
export const POSTER_ASPECT_RATIO = POSTER_WIDTH / POSTER_HEIGHT;

/** キャプチャ解像度。表示サイズに関係なくこのピクセル数で書き出す（3倍） */
export const CAPTURE_WIDTH = POSTER_WIDTH * 3;
export const CAPTURE_HEIGHT = POSTER_HEIGHT * 3;

/**
 * 氏名帯（Figma 2040:6128 / 2040:6129）。
 * 帯はスローガンより後に描かれる＝常に上に重なるので、
 * 縦書きスローガン側の下限もここから逆算する（vertical-slogan.tsx）。
 */
export const NAME_BAND_TOP = 348;
export const NAME_BAND_HEIGHT = 52;

/** 氏名帯のレイアウト崩れ防止 */
export const NAME_MAX_LENGTH = 8;

export type PosterPalette = {
  id: PosterPaletteId;
  label: string;
  /** 氏名帯の地色 */
  primary: string;
  /** カードの地色（primaryの薄い版） */
  surface: string;
  /** 縦書きスローガンの縁取り色 */
  stroke: string;
};

export const POSTER_PALETTES: PosterPalette[] = [
  {
    id: "red",
    label: "深紅",
    primary: "#c0392b",
    surface: "#fdefed",
    stroke: "#c0392b",
  },
  {
    id: "navy",
    label: "紺",
    primary: "#1a2744",
    surface: "#eef0f5",
    stroke: "#1a2744",
  },
  {
    // Figma 2040:6126 の既定。surface/primary はデザイン実測値
    id: "pink",
    label: "ピンク",
    primary: "#f4728a",
    surface: "#fff0f3",
    stroke: "#f4728a",
  },
];

export function getPosterPalette(id: PosterPaletteId) {
  return (
    POSTER_PALETTES.find((palette) => palette.id === id) ?? POSTER_PALETTES[2]
  );
}
