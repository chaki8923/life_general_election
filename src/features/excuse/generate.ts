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

/** できなかった理由の候補。AIが使えないときは固定の3つを返す */
export async function generateExcuseReasons({ wish }: { wish: Wish }) {
  const response = await generateJson<GeminiReasonsResponse>(
    buildExcuseReasonsPrompt(wish)
  );
  const reasons = pickStrings(response?.reasons)?.map((reason) => reason.trim());
  if (!reasons?.length) return buildMockReasons();
  // 多すぎ・少なすぎのどちらでもレイアウトが崩れないよう、必ず3件にそろえる
  const fallback = buildMockReasons();
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
  if (!excuses?.length) return buildMockExcuse(reason);
  return excuses[Math.floor(Math.random() * excuses.length)].trim();
}
