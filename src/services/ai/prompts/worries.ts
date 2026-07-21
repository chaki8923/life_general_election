/**
 * 悩み候補提案プロンプト。
 * nicknameは自由入力の準個人情報のためAIには渡さない。
 */
export function buildWorrySuggestionsPrompt(
  profile: { ageRange: string; gender?: string },
  interest: string
): string {
  const cohort = `${profile.ageRange}${profile.gender ? `・${profile.gender}` : ""}`;
  return `あなたは「1000人生総選挙」のヒアリングシステムです。
${cohort}の日本人で「${interest}」に関心がある人が抱えがちな悩みを6個提案してください。

ルール:
- それぞれ20〜25文字以内の具体的で共感しやすい悩みにする
  （例: 「お金の管理ができない」「給料が少ない」「貯金ができない」のようなトーン）。
- 内容が重複しないようにする。
- すべて日本語。

次のJSON形式のみで出力してください:
{
  "worries": [
    { "label": "悩みの内容" }
  ]
}`;
}
