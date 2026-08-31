import { getResolvedWishes } from "@/features/achievements/wish-history";
import type { PastPledgeResult } from "@/services/ai/prompts/election";
import type { Wish } from "@/types";

/** AIに渡す過去実績の件数。増やしすぎるとプロンプトが膨らみ、直近の傾向も薄まる */
export const PAST_RESULT_LIMIT = 3;

/**
 * 直近の「できた／できなかった」をAIへ渡す形に整える。
 * getResolvedWishes は達成日の昇順なので、末尾から取って新しい順に並べ直す。
 */
export function selectPastPledgeResults(
  wishes: Wish[],
  limit: number = PAST_RESULT_LIMIT
): PastPledgeResult[] {
  return getResolvedWishes(wishes)
    .slice(-limit)
    .reverse()
    .map((wish) => ({
      pledge: wish.text,
      policy: wish.policy,
      done: wish.status === "done",
      excuse: wish.excuse,
    }));
}
