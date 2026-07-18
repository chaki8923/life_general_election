import { generateJson } from "@/services/ai/gemini";
import { buildMockWorrySuggestions } from "@/services/ai/mock/worries";
import { buildWorrySuggestionsPrompt } from "@/services/ai/prompts/worries";
import type { UserProfile, WorrySuggestion } from "@/types";

type GeminiWorriesResponse = {
  worries: { label: string }[];
};

const SUGGESTION_COUNT = 6;

/**
 * プロフィールと興味関心から悩み候補を生成する。
 * Gemini設定済みならAI生成、未設定・失敗時はモックにフォールバック。
 */
export async function generateWorrySuggestions(
  profile: UserProfile,
  interest: string
): Promise<WorrySuggestion[]> {
  const res = await generateJson<GeminiWorriesResponse>(
    buildWorrySuggestionsPrompt(
      { ageRange: profile.ageRange, gender: profile.gender },
      interest
    )
  );

  const labels =
    res?.worries
      ?.map((w) => (typeof w?.label === "string" ? w.label.trim() : ""))
      .filter(Boolean) ?? [];

  const raw =
    labels.length >= SUGGESTION_COUNT
      ? labels
      : buildMockWorrySuggestions(interest);

  return raw.slice(0, SUGGESTION_COUNT).map((label, i) => ({
    id: `ws-${i + 1}`,
    label,
    category: interest,
  }));
}
