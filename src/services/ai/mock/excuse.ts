import { EXCUSE_REASON_MAX_LENGTH } from "@/constants/excuse";

/** AI が使えないときの理由候補（Figma 2665:17352 の文言）。政策に依存しない汎用の3つ */
const MOCK_REASONS = [
  "このところ気温が暑すぎた",
  "仕事を頑張りすぎた",
  "プライベートが充実しすぎた",
];

/**
 * 理由候補へ差し込める政策の上限。「{政策}には早すぎた」が
 * 理由候補の20文字以内に収まるよう、接尾辞6文字分を空ける。
 */
const POLICY_INLINE_MAX = EXCUSE_REASON_MAX_LENGTH - 6;

function characterLength(value: string) {
  return Array.from(value).length;
}

function inlinePolicy(policy?: string) {
  // 「〜、〜」と続く政策は前半だけで意味が通る
  const head = policy?.split(/[、。]/)[0]?.replace(/\s+/g, " ").trim();
  if (!head || characterLength(head) > POLICY_INLINE_MAX) return undefined;
  return head;
}

/**
 * できなかった理由の候補。政策が短ければ1つ目をその政策に引っかけた理由にし、
 * 残り2つは政策の外側（仕事・天気）から出す。
 * 「〜には」は「〜する」でも体言止めでも繋がるので、policy が旧データで
 * 名詞止まりでも文が壊れない。
 */
export function buildMockReasons(policy?: string) {
  const head = inlinePolicy(policy);
  if (!head) return [...MOCK_REASONS];
  return [`${head}には早すぎた`, MOCK_REASONS[1], MOCK_REASONS[0]];
}
