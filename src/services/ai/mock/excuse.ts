const MOCK_EXCUSES = [
  "今日は助走の日でした。本番の一歩は、元気を充電した明日の自分に託します。",
  "やる気が迷子になりましたが、帰り道は覚えているはず。今日は休憩にします。",
  "完璧なタイミングを待っていたら日が暮れました。次は小さく始めれば大丈夫。",
  "心の会議が長引き、本日の実行は見送りに。再提出できるので問題ありません。",
  "予定より自分をいたわる日になりました。休めた分だけ次の一歩が軽くなります。",
];

export function buildMockExcuse() {
  return MOCK_EXCUSES[Math.floor(Math.random() * MOCK_EXCUSES.length)];
}
