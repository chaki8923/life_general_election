import { loadDefaultJapaneseParser } from "budoux";

/** UAX #14 の WJ クラス。前後どちらへの改行も禁止する幅ゼロの文字 */
const WORD_JOINER = "⁠";

/**
 * 長い塊まで改行禁止にすると1行に収まらず、adjustsFontSizeToFitで文字が縮む。
 * この文字数を超える文節は通常どおり途中でも折り返させる。
 * 悩みの吹き出し（幅91px・16px）で全モックラベルを実測し、
 * 6なら縮小は最大でも5%（7だと19%、5だと「生活費がか/さんでいる」のように塊が崩れる）。
 */
const MAX_JOIN_LENGTH = 6;

const parser = loadDefaultJapaneseParser();

/** 同じラベルが再描画のたびに来るので、分割結果は使い回す */
const cache = new Map<string, string>();

/** 行頭に置けない文字（禁則）。この直前では改行できないので前の単位にくっつける */
const NO_BREAK_BEFORE =
  /^[)\]}）］｝」』〉》】〕、。，．・：；！？!?ー〜～…‥ゝゞヽヾ々ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ゛゜]/;
/** 行末に置けない文字（禁則）。この直後では改行できないので次の単位とくっつける */
const NO_BREAK_AFTER = /[([{（［｛「『〈《【〔]$/;

/**
 * 改行の最小単位。行数を見積もる側が使う。
 * MAX_JOIN_LENGTH を超える文節は phraseWrap で結合しないので途中でも折り返せる。
 * そのうえで禁則で切れない境目を潰す（『』付きラベルの末尾で行が伸びるのを見落とさないため）。
 */
export function phraseUnits(text: string) {
  const units: string[] = [];
  const raw = parser.parse(text).flatMap((phrase) => {
    const chars = [...phrase];
    return chars.length > MAX_JOIN_LENGTH ? chars : [phrase];
  });
  for (const unit of raw) {
    const prev = units[units.length - 1];
    if (
      prev !== undefined &&
      (NO_BREAK_BEFORE.test(unit) || NO_BREAK_AFTER.test(prev))
    ) {
      units[units.length - 1] = prev + unit;
    } else {
      units.push(unit);
    }
  }
  return units;
}

/**
 * 文節の内部に WORD JOINER を挟み、文節の切れ目だけで改行させる。
 * CSS の `word-break: auto-phrase` に相当するものが React Native に無いための代替。
 */
export function phraseWrap(text: string) {
  const cached = cache.get(text);
  if (cached !== undefined) return cached;

  const wrapped = parser
    .parse(text)
    .map((phrase) => {
      const chars = [...phrase];
      return chars.length > MAX_JOIN_LENGTH
        ? phrase
        : chars.join(WORD_JOINER);
    })
    .join("");

  cache.set(text, wrapped);
  return wrapped;
}
