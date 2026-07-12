/** ポスターは選挙ポスターの定番比率 3:4(縦長) */
export const POSTER_ASPECT_RATIO = 3 / 4;

/** キャプチャ解像度。表示サイズに関係なくこのピクセル数で書き出す */
export const CAPTURE_WIDTH = 1080;
export const CAPTURE_HEIGHT = 1440;

/** 縦書き名前のレイアウト崩れ防止 */
export const NAME_MAX_LENGTH = 8;

export type PosterPalette = {
  id: "red" | "navy" | "pink";
  label: string;
  /** 公約帯(上部)の背景 */
  band: string;
  /** 名前帯(下部)の背景 */
  bottom: string;
  /** 縦書き名前の縁取り色 */
  nameStroke: string;
};

export const POSTER_PALETTES: PosterPalette[] = [
  {
    id: "red",
    label: "深紅",
    band: "bg-election-red",
    bottom: "bg-election-navy",
    nameStroke: "text-election-red-dark",
  },
  {
    id: "navy",
    label: "紺",
    band: "bg-election-navy",
    bottom: "bg-election-red-dark",
    nameStroke: "text-election-navy",
  },
  {
    id: "pink",
    label: "ピンク",
    band: "bg-election-pink",
    bottom: "bg-election-navy",
    // ピンクの縁取りは視認性が落ちるためnavyで締める
    nameStroke: "text-election-navy",
  },
];
