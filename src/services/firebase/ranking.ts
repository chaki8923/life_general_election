import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import type { ThemeStat } from "@/types";
import { getDb } from "./config";

/**
 * 過去の悩みランキングを取得。
 * Firebase未設定時はnullを返し、呼び出し側でローカル集計にフォールバックする。
 */
export async function fetchThemeRanking(
  top: number = 10
): Promise<ThemeStat[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const q = query(
      collection(db, "themeStats"),
      orderBy("count", "desc"),
      limit(top)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        themeId: d.id,
        label: data.label ?? "",
        category: data.category ?? "",
        count: data.count ?? 0,
      };
    });
  } catch (e) {
    if (__DEV__) console.warn("[fetchThemeRanking]", e);
    return null;
  }
}
