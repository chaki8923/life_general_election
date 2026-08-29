import { generateJson } from "@/services/ai/gemini";
import { buildMockExcuse, buildMockReasons } from "@/services/ai/mock/excuse";
import {
  buildExcusePrompt,
  buildExcuseReasonsPrompt,
} from "@/services/ai/prompts/excuse";
import type { Wish } from "@/types";

type GeminiExcuseResponse = {
  excuses: string[];
};

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

/** policy 未設定の古い公約では、公約そのものを政策として扱う（プロンプト側と同じ寄せ方） */
function resolvePolicy(wish: Wish) {
  return wish.policy?.trim() || wish.text;
}

/** できなかった理由の候補。AIが使えないときは政策から組み立てた3つを返す */
export async function generateExcuseReasons({ wish }: { wish: Wish }) {
  const response = await generateJson<GeminiReasonsResponse>(
    buildExcuseReasonsPrompt(wish)
  );
  const reasons = pickStrings(response?.reasons)?.map((reason) => reason.trim());
  // 多すぎ・少なすぎのどちらでもレイアウトが崩れないよう、必ず3件にそろえる
  const fallback = buildMockReasons(resolvePolicy(wish));
  if (!reasons?.length) return fallback;
  return Array.from(
    { length: EXCUSE_REASON_COUNT },
    (_, index) => reasons[index] ?? fallback[index]
  );
}

export async function generateExcuse({
  wish,
  reason,
}: {
  wish: Wish;
  reason: string;
}) {
  const response = await generateJson<GeminiExcuseResponse>(
    buildExcusePrompt(wish, reason)
  );
  const excuses = pickStrings(response?.excuses);
  if (!excuses?.length) return buildMockExcuse(reason, resolvePolicy(wish));
  return excuses[Math.floor(Math.random() * excuses.length)].trim();
}
