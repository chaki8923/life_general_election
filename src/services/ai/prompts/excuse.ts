import { EXCUSE_REASON_MAX_LENGTH } from "@/constants/excuse";
import type { Wish } from "@/types";

/**
 * 公約と政策の提示部分。policy が無い（または公約と同じ）古いデータで
 * 同じ文字列を2行並べると「別物が2つある」と誤解されるので、1行にまとめる。
 * どちらの形でも、ルールから指せる「政策」が必ず1つある状態にする。
 */
function buildTargetLines(wish: Wish): string {
  const pledge = wish.text.trim();
  const policy = wish.policy?.trim();
  if (!policy || policy === pledge) return `実行できなかった政策: ${pledge}`;
  return `人生公約: ${pledge}\n実行できなかった政策: ${policy}`;
}

/** できなかった理由の候補（Figma 2665:17352 OptionsStack）を3つ作らせる */
export function buildExcuseReasonsPrompt(wish: Wish): string {
  return `あなたは、目標を達成できなかった人の自己肯定感を守る「やさしい言い訳作家」です。
次の政策を実行できなかった人が「たしかにこれだ」と思える理由の候補を3つ作ってください。

${buildTargetLines(wish)}

ルール:
- それぞれ${EXCUSE_REASON_MAX_LENGTH}文字以内の短い一言。
- 3つのうち2つは、その政策の中身に引っかかった理由にする。
  政策が「ひと月にかかる費用を書き出す」なら「レシートが多すぎた」のように、
  その政策をやろうとして初めてぶつかる具体的な壁を挙げる。
- 残り1つは天気・体調・仕事など、政策の外側の理由にする。
- 本人を責めない。「暑すぎた」「頑張りすぎた」のように、前向きに言い換えた理由にする。
- 3つで同じ言葉を繰り返さない。
- 政策の文言をそのまま書き写さない。
- 事実を捏造したり、他人を悪者にしたりしない。
- すべて日本語。文末に句点は付けない。

次のJSON形式のみで出力してください:
{"reasons":["理由1","理由2","理由3"]}`;
}
