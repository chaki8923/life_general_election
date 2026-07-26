import type { PosterPaletteId } from "@/types";

/** ポスターは選挙ポスターの定番比率 3:4(縦長) */
export const POSTER_ASPECT_RATIO = 3 / 4;

/** キャプチャ解像度。表示サイズに関係なくこのピクセル数で書き出す */
export const CAPTURE_WIDTH = 1080;
export const CAPTURE_HEIGHT = 1440;

/** 縦書き名前のレイアウト崩れ防止 */
export const NAME_MAX_LENGTH = 8;

export type PosterPalette = {
  id: PosterPaletteId;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const POSTER_PALETTES: PosterPalette[] = [
  {
    id: "red",
    label: "深紅",
    primary: "#c0392b",
    secondary: "#1a2744",
    accent: "#d4af37",
  },
  {
    id: "navy",
    label: "紺",
    primary: "#1a2744",
    secondary: "#96281b",
    accent: "#d4af37",
  },
  {
    id: "pink",
    label: "ピンク",
    primary: "#ed5b7f",
    secondary: "#1a2744",
    accent: "#ffc14d",
  },
];

export function getPosterPalette(id: PosterPaletteId) {
  return POSTER_PALETTES.find((palette) => palette.id === id) ?? POSTER_PALETTES[2];
}
