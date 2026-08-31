import { EXCUSE_REASON_MAX_LENGTH } from "@/constants/excuse";
import { generateJson } from "@/services/ai/gemini";
import { buildMockReasons } from "@/services/ai/mock/excuse";
import { buildExcuseReasonsPrompt } from "@/services/ai/prompts/excuse";
import type { Wish } from "@/types";

type GeminiReasonsResponse = {
  reasons: string[];
};

/** Figma 2665:17352。選択肢は必ず3つ並ぶので、足りなければモックで埋める */
export const EXCUSE_REASON_COUNT = 3;

function pickStrings(values: string[] | undefined) {
  return values?.filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );
}

/** 履歴カードにそのまま保存できる1行の選択肢だけを採用する */
export function normalizeExcuseReason(value: string): string | null {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (
    normalized.length === 0 ||
    Array.from(normalized).length > EXCUSE_REASON_MAX_LENGTH
  ) {
    return null;
  }
  return normalized;
}

/** policy 未設定の古い公約では、公約そのものを政策として扱う（プロンプト側と同じ寄せ方） */
function resolvePolicy(wish: Wish) {
  return wish.policy?.trim() || wish.text;
}

/** できなかった理由の候補。AIが使えないときは政策から組み立てた3つを返す */
export async function generateExcuseReasons({ wish }: { wish: Wish }) {
  const response = await generateJson<GeminiReasonsResponse>(
    buildExcuseReasonsPrompt(wish)
  );
  const reasons = pickStrings(response?.reasons)
    ?.map(normalizeExcuseReason)
    .filter((reason): reason is string => reason !== null);
  // 多すぎ・少なすぎのどちらでもレイアウトが崩れないよう、必ず3件にそろえる
  const fallback = buildMockReasons(resolvePolicy(wish));
  if (!reasons?.length) return fallback;
  return Array.from(
    { length: EXCUSE_REASON_COUNT },
    (_, index) => reasons[index] ?? fallback[index]
  );
}
