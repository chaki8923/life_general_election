import {
  getPosterLevel,
  POSTER_LEVEL_META,
  POSTER_LEVEL_THRESHOLDS,
  type PosterLevel,
} from "@/features/poster/level";
import type { Wish } from "@/types";

export const MILESTONES = POSTER_LEVEL_THRESHOLDS.map((requiredCount, index) => {
  const level = index as PosterLevel;
  return {
    level,
    requiredCount,
    title: POSTER_LEVEL_META[level].shortTitle,
  };
});

const MAX_LEVEL = (MILESTONES.length - 1) as PosterLevel;

/**
 * 達成ポイントを等間隔に並べたときの、バーの塗り割合（0〜1）。
 * ポイント間は「1政策クリアごとに」線形に伸びる。
 */
export function getMilestoneFillRatio(doneCount: number) {
  const level = getPosterLevel(doneCount);
  if (level >= MAX_LEVEL) return 1;
  const start = POSTER_LEVEL_THRESHOLDS[level];
  const nextAt = POSTER_LEVEL_THRESHOLDS[level + 1];
  const withinLevel = (Math.max(start, doneCount) - start) / (nextAt - start);
  return (level + withinLevel) / MAX_LEVEL;
}

/**
 * その達成ポイントを解錠した政策たち。
 * ポイントi（i>=1）は「i-1個目の閾値からi個目の閾値までに達成した政策」。
 * ポイント0（0件・新人）は開始地点なので常に空。
 */
export function getWishesForMilestone(doneWishes: Wish[], index: number) {
  if (index <= 0) return [];
  const ordered = [...doneWishes].sort(
    (a, b) => (a.doneAt ?? a.createdAt) - (b.doneAt ?? b.createdAt)
  );
  const from = POSTER_LEVEL_THRESHOLDS[index - 1];
  const to = POSTER_LEVEL_THRESHOLDS[index];
  return ordered.slice(from, to);
}

/** 初期選択：到達済みで中身のある一番上のポイント */
export function getDefaultMilestoneIndex(doneCount: number) {
  return Math.max(0, getPosterLevel(doneCount));
}
