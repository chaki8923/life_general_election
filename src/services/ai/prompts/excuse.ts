import type { Wish } from "@/types";

export function buildExcusePrompt(wish: Wish): string {
  return `あなたは、目標を達成できなかった人の自己肯定感を守る「やさしい言い訳作家」です。
次の人生公約と政策について、責める表現を避け、少しユーモラスで前向きになれる日本語の言い訳を3つ作ってください。

人生公約: ${wish.text}
掲げる政策: ${wish.policy ?? wish.text}

ルール:
- それぞれ50文字以内。
- 他人を傷つけたり、事実を捏造したりしない。
- 休むことや再挑戦を肯定する、やさしい語調にする。
- すべて日本語。

次のJSON形式のみで出力してください:
{"excuses":["言い訳1","言い訳2","言い訳3"]}`;
}
