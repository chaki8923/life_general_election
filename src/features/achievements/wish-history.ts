import type { Wish } from "@/types";

/** 履歴に載せる公約（達成 or 未達成報告済み） */
export function isResolvedWish(wish: Wish) {
  return wish.status === "done" || wish.status === "excused";
}

/** カード・日付バーに使う達成日（doneAt / excusedAt） */
export function getWishAchievementDate(wish: Wish): number | null {
  if (wish.status === "done" && wish.doneAt != null) return wish.doneAt;
  if (wish.status === "excused" && wish.excusedAt != null) return wish.excusedAt;
  return null;
}

/** 達成日時の古い順 */
export function getResolvedWishes(wishes: Wish[]): Wish[] {
  return wishes
    .filter(isResolvedWish)
    .sort(
      (a, b) =>
        (getWishAchievementDate(a) ?? a.createdAt) -
        (getWishAchievementDate(b) ?? b.createdAt)
    );
}

export function getResolvedTimelineDates(wishes: Wish[]): number[] {
  return getResolvedWishes(wishes)
    .map(getWishAchievementDate)
    .filter((value): value is number => value != null);
}
