/**
 * 悩み候補画面（election/worries）で使う画像。
 * ひとつ前の画面から先読みするので、表示側と先読み側が同じモジュールを指すようここへ集約している。
 */
export const WORRIES_BACKGROUND = require("../../assets/election/worries-bg.webp");
export const WORRY_CHARACTER = require("../../assets/election/worry-character.webp");

/** 先読み用のまとめ */
export const WORRIES_IMAGES: number[] = [WORRIES_BACKGROUND, WORRY_CHARACTER];
