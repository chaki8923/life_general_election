import { phraseUnits } from "@/utils/phrase-wrap";
import { DESIGN_WIDTH } from "./layout";
import { WORRY_BUBBLE_COLORS } from "./worry-bubble-colors";

export const WORRY_BUBBLE_SHAPES = {
  orange: require("../../../assets/election/worry-bubble-orange.svg"),
  pink: require("../../../assets/election/worry-bubble-pink.svg"),
  green: require("../../../assets/election/worry-bubble-green.svg"),
  purple: require("../../../assets/election/worry-bubble-purple.svg"),
  blue: require("../../../assets/election/worry-bubble-blue.svg"),
} as const;

/**
 * Figma 916:14877 の吹き出し5枠。x,w,h はアートボード(390幅)基準、
 * y は CONTENT_TOP（ステッパー下端）を原点にした値。
 * textCenterX/Y は雲ごとに主ローブの位置が違うので個別に持つ（SVGのパスから実測した
 * 主ローブの外接矩形の中心。orangeだけ形が違い 0.581/0.405、他4形は 0.549/0.466）。
 * 確認画面も同じ形・同じ向きで拡大表示するため、BubbleFieldと共有している。
 */
export const WORRY_BUBBLE_SLOTS = [
  {
    shape: "orange",
    color: WORRY_BUBBLE_COLORS[0],
    x: 18,
    y: 75.706,
    w: 153.001,
    h: 135.9,
    textCenterX: 0.58,
    textCenterY: 0.41,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: false,
    hint: { x: 145, y: 52.706 },
  },
  {
    shape: "pink",
    color: WORRY_BUBBLE_COLORS[1],
    x: 229,
    y: 64.706,
    w: 151.47,
    h: 126,
    textCenterX: 0.549,
    textCenterY: 0.466,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: true,
    hint: null,
  },
  {
    shape: "green",
    color: WORRY_BUBBLE_COLORS[2],
    x: 112,
    y: 176.706,
    w: 170.833,
    h: 142.109,
    textCenterX: 0.549,
    textCenterY: 0.466,
    textWidthRatio: 0.62,
    textHeightRatio: 0.56,
    flipX: true,
    hint: { x: 72, y: 235.706 },
  },
  {
    shape: "purple",
    color: WORRY_BUBBLE_COLORS[3],
    x: 18,
    y: 311.706,
    w: 151.47,
    h: 126,
    textCenterX: 0.549,
    textCenterY: 0.466,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: false,
    hint: { x: 149, y: 353.706 },
  },
  {
    shape: "blue",
    color: WORRY_BUBBLE_COLORS[4],
    x: 206,
    y: 347.706,
    w: 151.469,
    h: 126,
    textCenterX: 0.549,
    textCenterY: 0.466,
    textWidthRatio: 0.6,
    textHeightRatio: 0.54,
    flipX: true,
    hint: { x: 336, y: 331.706 },
  },
] as const;

export type WorryBubbleSlot = (typeof WORRY_BUBBLE_SLOTS)[number];

/** Figma上の吹き出し文字サイズ（アートボード基準）。フィット計算の上限でもある */
export const BUBBLE_FONT_SIZE = 16;

/** worry-bubble-cloud.tsx の lineHeight と揃える */
const LINE_HEIGHT_RATIO = 1.32;
/** worry-bubble-cloud.tsx の numberOfLines と揃える */
const MAX_LINES = 4;
/** これ以上小さくしても読めないので下限。溢れたら ellipsize に任せる */
const MIN_FONT_SIZE = 8;
const FONT_SIZE_STEP = 0.5;

/**
 * 文字送りの見積もり（em単位）。全角は1em、ASCIIは0.7em。
 * NotoSansJP_700Bold の実測（数字0.657 / 英大0.669 / 英小0.575）より大きめに取り、
 * 見積もりが甘くて枠から溢れることがないようにしている。
 */
function measureEm(text: string) {
  let em = 0;
  for (const char of text) {
    em += (char.codePointAt(0) ?? 0) < 0x2000 ? 0.7 : 1;
  }
  return em;
}

/**
 * 文節単位で貪欲に詰めたときの行数。
 * 1単位で maxEm を超えるものがあると横に溢れる（文節内は改行できない）ので、
 * そのときは収まらない扱いにして呼び出し側にサイズを下げさせる。
 */
function countLines(units: string[], maxEm: number) {
  let lines = 1;
  let current = 0;
  for (const unit of units) {
    const width = measureEm(unit);
    if (width > maxEm) return Number.POSITIVE_INFINITY;
    if (current > 0 && current + width > maxEm) {
      lines += 1;
      current = width;
    } else {
      current += width;
    }
  }
  return lines;
}

/**
 * 字送りの見積もりと、プラットフォームごとの改行規則（どこまで語中で割れるか）のズレを吸収する。
 * 実測では最大でも枠の5.5%ぶんしか行が伸びなかったので、それを飲み込める幅にしている。
 */
const SAFETY_RATIO = 0.93;

function fitsInSlot(label: string, slot: WorryBubbleSlot, fontSize: number) {
  const text = slot.quoted ? `『${label}』` : label;
  // flipXは反転でローブの安全領域が狭くなるぶんを幅側で見込む
  const usableWidth =
    slot.w * slot.textWidthRatio * (slot.flipX ? 0.94 : 1) * SAFETY_RATIO;
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const maxLines = Math.min(
    MAX_LINES,
    Math.floor((slot.h * slot.textHeightRatio) / lineHeight)
  );
  if (maxLines < 1) return false;
  return countLines(phraseUnits(text), usableWidth / fontSize) <= maxLines;
}

/**
 * 5枚すべてが枠に収まる最大の文字サイズ（アートボード基準）。
 * 枠ごとに最適サイズを出すと1枚だけ極端に小さくなるので、全体を一番きついラベルに揃える。
 */
export function fitBubbleFontSize(labels: string[]) {
  for (
    let size = BUBBLE_FONT_SIZE;
    size >= MIN_FONT_SIZE;
    size -= FONT_SIZE_STEP
  ) {
    const fits = labels.every((label, index) =>
      fitsInSlot(label, getWorryBubbleSlot(index), size)
    );
    if (fits) return size;
  }
  return MIN_FONT_SIZE;
}

/** 確認画面の見出し下端(128.706)とボタン上端(381.706)の間に16pxずつ余白を残せる上限 */
const CONFIRM_MAX_WIDTH = 300;
const CONFIRM_MAX_HEIGHT = 221;

/** 拡大しても吹き出しの中心Yは動かさないので、寄せアニメーションの着地点と一致する */
export const CONFIRM_CENTER_Y = 255.206;

/** 範囲外のindexでも先頭の枠にフォールバックする */
export function getWorryBubbleSlot(index: number): WorryBubbleSlot {
  return WORRY_BUBBLE_SLOTS[index] ?? WORRY_BUBBLE_SLOTS[0];
}

/**
 * 選んだ吹き出しをそのまま相似拡大した、確認画面での雲の位置とサイズ（アートボード基準）。
 * 文字サイズも scale 倍で渡せば、文字枠の幅と文字サイズの比が選択前と一致するので
 * 改行位置が変わらない。5形とも高さ側が効くため height は常に221になる。
 */
export function getConfirmCloudRect(index: number) {
  const slot = getWorryBubbleSlot(index);
  const scale = Math.min(
    CONFIRM_MAX_WIDTH / slot.w,
    CONFIRM_MAX_HEIGHT / slot.h
  );
  const width = slot.w * scale;
  const height = slot.h * scale;
  return {
    scale,
    width,
    height,
    left: (DESIGN_WIDTH - width) / 2,
    top: CONFIRM_CENTER_Y - height / 2,
  };
}
