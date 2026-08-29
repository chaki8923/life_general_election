/** AI が使えないときの理由候補（Figma 2665:17352 の文言）。政策に依存しない汎用の3つ */
const MOCK_REASONS = [
  "このところ気温が暑すぎた",
  "仕事を頑張りすぎた",
  "プライベートが充実しすぎた",
];

/** 理由も政策も無いときのフォールバック文面 */
const MOCK_EXCUSES = [
  "今日は助走の日だったんだ\n本番の一歩は明日の君に任せよう",
  "やる気が迷子になっただけだよ\n帰り道は覚えているから大丈夫",
  "完璧なタイミングを待っていたんだ\n次は小さく始めれば うまくいく",
  "心の会議が長引いただけだよ\n再提出できるから問題なし",
  "今日は自分をいたわる日だったんだ\n休めた分だけ次の一歩が軽くなる",
];

/**
 * 文面に差し込める政策の上限。言い訳の1行は30文字までの設計で、
 * 「君は今回」＋「{政策}には早すぎた」＋「んだ」= 政策+12文字になるため、
 * 18文字を超える政策は埋め込まず政策非依存の文面へ逃がす。
 */
const POLICY_INLINE_MAX = 18;

function inlinePolicy(policy?: string) {
  // 「〜、〜」と続く政策は前半だけで意味が通る
  const head = policy?.split(/[、。]/)[0]?.trim();
  if (!head || head.length > POLICY_INLINE_MAX) return undefined;
  return head;
}

/**
 * できなかった理由の候補。政策が短ければ1つ目をその政策に引っかけた理由にし、
 * 残り2つは政策の外側（仕事・天気）から出す。
 * 「〜には」「〜だけでいいよ」は「〜する」でも体言止めでも繋がるので、
 * policy が旧データで名詞止まりでも文が壊れない。
 */
export function buildMockReasons(policy?: string) {
  const head = inlinePolicy(policy);
  if (!head) return [...MOCK_REASONS];
  return [`${head}には早すぎた`, MOCK_REASONS[1], MOCK_REASONS[0]];
}

/** reason があれば、それを織り込んだ2行の言い訳を組み立てる */
export function buildMockExcuse(reason?: string, policy?: string) {
  const trimmedReason = reason?.trim();
  if (!trimmedReason) {
    return MOCK_EXCUSES[Math.floor(Math.random() * MOCK_EXCUSES.length)];
  }
  const head = inlinePolicy(policy);
  // 1行目がすでに政策に触れているなら、2行目で同じ文言を繰り返さない
  const alreadyNamed = head !== undefined && trimmedReason.startsWith(head);
  const encouragement =
    head && !alreadyNamed
      ? // 2行目は政策をもっと小さく刻んだ一歩にする（プロンプト側と同じ方針）
        `明日は${head}だけでいいよ`
      : "ゆっくり休んで また明日はじめよう";
  return `君は今回${trimmedReason}んだ\n${encouragement}`;
}
