/** AI が使えないときの理由候補（Figma 2665:17352 の文言） */
const MOCK_REASONS = [
  "このところ気温が暑すぎた",
  "仕事を頑張りすぎた",
  "プライベートが充実しすぎた",
];

/** 理由を選べなかったときのフォールバック文面 */
const MOCK_EXCUSES = [
  "今日は助走の日だったんだ\n本番の一歩は明日の君に任せよう",
  "やる気が迷子になっただけだよ\n帰り道は覚えているから大丈夫",
  "完璧なタイミングを待っていたんだ\n次は小さく始めれば うまくいく",
  "心の会議が長引いただけだよ\n再提出できるから問題なし",
  "今日は自分をいたわる日だったんだ\n休めた分だけ次の一歩が軽くなる",
];

export function buildMockReasons() {
  return [...MOCK_REASONS];
}

/** reason があれば、それを織り込んだ2行の言い訳を組み立てる */
export function buildMockExcuse(reason?: string) {
  if (!reason?.trim()) {
    return MOCK_EXCUSES[Math.floor(Math.random() * MOCK_EXCUSES.length)];
  }
  return `君は今回${reason.trim()}んだ\nゆっくり休んで また明日はじめよう`;
}
