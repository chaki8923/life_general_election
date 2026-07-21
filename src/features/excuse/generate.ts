import { generateJson } from "@/services/ai/gemini";
import { buildMockExcuse } from "@/services/ai/mock/excuse";
import { buildExcusePrompt } from "@/services/ai/prompts/excuse";
import type { Wish } from "@/types";

type GeminiExcuseResponse = {
  excuses: string[];
};

export async function generateExcuse({ wish }: { wish: Wish }) {
  const response = await generateJson<GeminiExcuseResponse>(
    buildExcusePrompt(wish)
  );
  const excuses = response?.excuses?.filter(
    (excuse): excuse is string =>
      typeof excuse === "string" && excuse.trim().length > 0
  );
  if (!excuses?.length) return buildMockExcuse();
  return excuses[Math.floor(Math.random() * excuses.length)].trim();
}
