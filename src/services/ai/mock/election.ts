/** Gemini未設定・障害時のフォールバック用モック候補 */

export type RawCandidate = {
  label: string;
  votes: number;
  isMinority: boolean;
  comment: string;
  action: string;
};

const MOCK_BY_CATEGORY: Record<string, RawCandidate[]> = {
  "恋愛・結婚": [
    { label: "パートナーと将来の話を5分した", votes: 328, isMinority: false, comment: "5分だけなら喧嘩にならない", action: "今夜「将来どうする？」と一言だけ聞く" },
    { label: "結婚式場のサイトを眺めた", votes: 244, isMinority: false, comment: "見るだけならタダ", action: "式場サイトを1つブックマーク" },
    { label: "友人夫婦にリアルな話を聞いた", votes: 187, isMinority: false, comment: "現実を知って逆に安心した", action: "既婚の友人にLINEしてみる" },
    { label: "指輪の相場をこっそり調べた", votes: 141, isMinority: false, comment: "思ったより幅があった", action: "「婚約指輪 相場」で検索" },
    { label: "婚姻届を眺めてそっと閉じた", votes: 52, isMinority: true, comment: "紙は軽いのに気持ちは重い", action: "役所のサイトで婚姻届を見るだけ" },
    { label: "ドラマの結婚式で泣いた", votes: 31, isMinority: true, comment: "気持ちの準備はできてるかも", action: "結婚がテーマの作品を1本観る" },
    { label: "「結婚 タイミング」で検索して閉じた", votes: 17, isMinority: true, comment: "検索しただけで今日は満足", action: "検索して1記事だけ読む" },
  ],
  "仕事・キャリア": [
    { label: "求人を1件だけ見た", votes: 312, isMinority: false, comment: "見るだけなら会社にバレない", action: "求人サイトで1件だけ見る" },
    { label: "職務経歴を箇条書きにしてみた", votes: 236, isMinority: false, comment: "意外とやってきたことあった", action: "スマホメモに3行書く" },
    { label: "転職した友人に話を聞いた", votes: 198, isMinority: false, comment: "隣の芝生、普通に青かった", action: "転職経験者にご飯に誘うLINE" },
    { label: "転職サイトに登録だけした", votes: 154, isMinority: false, comment: "登録しただけで転職した気分", action: "転職サイトに無料登録" },
    { label: "求人サイトを開いて3秒で閉じた", votes: 48, isMinority: true, comment: "開いた勇気を褒めてほしい", action: "アプリを開くだけでOK" },
    { label: "給料明細を眺めてため息をついた", votes: 33, isMinority: true, comment: "ため息も立派な現状分析", action: "先月の給料明細を見返す" },
    { label: "退職届のテンプレを保存した", votes: 19, isMinority: true, comment: "お守りとして持っておく", action: "テンプレを1つ保存するだけ" },
  ],
  お金: [
    { label: "先月の支出をざっくり眺めた", votes: 341, isMinority: false, comment: "コンビニが優勝してた", action: "銀行アプリで先月分を見る" },
    { label: "家計簿アプリを入れた", votes: 227, isMinority: false, comment: "入れただけで貯まる気がする", action: "無料の家計簿アプリを1つDL" },
    { label: "サブスクを1つ解約した", votes: 179, isMinority: false, comment: "観てないのに払ってた…", action: "サブスク一覧を確認する" },
    { label: "つみたて投資を調べた", votes: 133, isMinority: false, comment: "単語の意味は半分わからない", action: "「NISA とは」で検索" },
    { label: "小銭貯金を始めて3日で忘れた", votes: 61, isMinority: true, comment: "3日は続いたのでヨシ", action: "貯金箱に小銭を入れるだけ" },
    { label: "残高を見て見なかったことにした", votes: 42, isMinority: true, comment: "確認したのは事実だから", action: "残高を1回だけ見る" },
    { label: "宝くじ売り場の前で立ち止まった", votes: 17, isMinority: true, comment: "夢を見る準備はできている", action: "立ち止まるだけならタダ" },
  ],
  default: [
    { label: "とりあえずスマホで検索してみた", votes: 356, isMinority: false, comment: "検索は行動の第一歩", action: "悩みをそのまま検索する" },
    { label: "友達に悩みを話してみた", votes: 248, isMinority: false, comment: "話したら半分軽くなった", action: "信頼できる人にLINEする" },
    { label: "メモアプリに気持ちを書き出した", votes: 176, isMinority: false, comment: "書いたら頭が整理された", action: "スマホメモに3行書く" },
    { label: "関連する本を1冊ポチった", votes: 128, isMinority: false, comment: "積読も前進のうち", action: "気になる本をカートに入れる" },
    { label: "寝る前に5分だけ考えた", votes: 49, isMinority: true, comment: "考えたまま寝落ちした", action: "寝る前に5分だけ考える" },
    { label: "深いため息をついて空を見た", votes: 28, isMinority: true, comment: "空はいつでも味方", action: "窓の外を30秒眺める" },
    { label: "「明日の自分」に任せた", votes: 15, isMinority: true, comment: "明日の自分はきっとやれる", action: "今日はもう寝る" },
  ],
};

export function buildMockCandidates(category: string): RawCandidate[] {
  return MOCK_BY_CATEGORY[category] ?? MOCK_BY_CATEGORY.default;
}
