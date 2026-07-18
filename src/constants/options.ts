/** オンボーディングの選択肢マスタ */

export const AGE_RANGES = [
  "20代前半",
  "20代後半",
  "30代前半",
  "30代後半",
  "40代以上",
] as const;

export const GENDERS = ["男性", "女性", "その他", "回答しない"] as const;

export const RELATIONSHIP_STATUSES = [
  "独身（恋人なし）",
  "恋人あり",
  "同棲中",
  "婚約中",
  "既婚",
] as const;

export const SAVINGS_RANGES = [
  "ほぼゼロ",
  "〜50万円",
  "〜100万円",
  "〜300万円",
  "〜500万円",
  "500万円以上",
  "秘密",
] as const;

export const HOBBIES = [
  "筋トレ",
  "旅行",
  "ゲーム",
  "推し活",
  "グルメ",
  "サウナ",
  "読書",
  "アウトドア",
  "お酒",
  "特になし",
] as const;

export const MOTIVATIONS = [
  "なんとなく将来が不安",
  "パートナーとの今後を考えたい",
  "仕事・キャリアを見直したい",
  "お金のことをちゃんとしたい",
  "とりあえず面白そうだから",
] as const;
