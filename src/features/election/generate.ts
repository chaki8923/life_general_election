import { generateJson } from "@/services/ai/gemini";
import {
  buildMockCandidates,
  type RawCandidate,
} from "@/services/ai/mock/election";
import { buildElectionPrompt } from "@/services/ai/prompts/election";
import type { Candidate, Election, Worry } from "@/types";

type GeminiElectionResponse = {
  candidates: RawCandidate[];
};

function isValidCandidate(c: unknown): c is RawCandidate {
  const x = c as RawCandidate;
  return (
    typeof x?.label === "string" &&
    typeof x?.votes === "number" &&
    typeof x?.comment === "string" &&
    typeof x?.action === "string"
  );
}

/**
 * 悩みから総選挙の開票結果を生成する。
 * Gemini設定済みならAI生成、未設定・失敗時はモックにフォールバック。
 */
export async function generateElection(worry: Worry): Promise<Election> {
  const res = await generateJson<GeminiElectionResponse>(
    buildElectionPrompt(worry.text, worry.category)
  );

  const raw: RawCandidate[] =
    res?.candidates?.filter(isValidCandidate).length
      ? res.candidates.filter(isValidCandidate)
      : buildMockCandidates(worry.category);

  const sorted = [...raw].sort((a, b) => b.votes - a.votes);
  const candidates: Candidate[] = sorted.map((c, i) => ({
    id: `c${i + 1}`,
    label: c.label,
    votes: Math.max(0, Math.round(c.votes)),
    isMinority: Boolean(c.isMinority),
    comment: c.comment,
    action: c.action,
  }));

  return {
    id: `e-${Date.now().toString(36)}`,
    themeId: worry.id,
    themeLabel: worry.text,
    category: worry.category,
    candidates,
    totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
    createdAt: Date.now(),
  };
}
