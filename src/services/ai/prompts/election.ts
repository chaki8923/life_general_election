/** 開票生成でAIに渡す本人の属性（nicknameは準個人情報のため渡さない） */
export type ElectionPromptContext = {
  ageRange: string;
  gender?: string;
  motivation: string;
};

/** 総選挙（1000人の小さな一歩シミュレーション）生成プロンプト */
export function buildElectionPrompt(
  worryText: string,
  category: string,
  context: ElectionPromptContext
): string {
  const cohort = `${context.ageRange}${context.gender ? `・${context.gender}` : ""}`;
  return `あなたは「1000人生総選挙」の開票システムです。
「${worryText}」（カテゴリ: ${category}）という悩みを持つ、${cohort}の似た境遇の日本人1000人が
これから踏み出す「小さな一歩」への投票結果をシミュレーションしてください。
本人の今のモチベーションは「${context.motivation}」です。

ルール:
- 候補は6〜8個。votesの合計はちょうど1000にする。
- label は必ず現在形の言い切り（「〜する」「〜見る」「〜つける」）で書く。
  これから掲げる公約なので、過去形（「〜した」「〜だった」）は絶対に使わない。
- 上位候補は現実的で小さな一歩（例: 「求人を1件だけ見る」）。
- モチベーションに合わせて票の分布を調整する
  （「やる気に満ち溢れている」ならやや挑戦的な一歩を上位に、
  「小さなことから始めたい」ならハードルの低い一歩を上位にする）。
- 必ず2〜3個は isMinority: true の「ハードル激低なマイノリティの一歩」を含める
  （例: 「求人サイトを開いて3秒で閉じる」「給料明細を眺めてため息をつく」など、得票50票以下）。
- comment は投票者のリアルで少し笑える一言（30文字以内）。
- action は今日すぐできる具体的アクション（30文字以内）。
- すべて日本語。

次のJSON形式のみで出力してください:
{
  "candidates": [
    {
      "label": "一歩の内容（25文字以内・現在形の言い切り）",
      "votes": 312,
      "isMinority": false,
      "comment": "投票者の一言",
      "action": "今日の一歩"
    }
  ]
}`;
}
