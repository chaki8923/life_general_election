/**
 * Firestoreへのミラーリング層。
 * UI上の状態管理はZustand(ローカル永続化)が主で、ここでは
 * 集計・分析用にFirestoreへ書き込む（fire-and-forget）。
 * Firebase未設定時は何もしない。
 */
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type {
  Election,
  KpiEventType,
  UserProfile,
  Wish,
} from "@/types";
import { getDb } from "./config";
import { getCurrentUid } from "./auth";

function safeCall(fn: () => Promise<unknown>) {
  fn().catch((e) => {
    if (__DEV__) console.warn("[firestore mirror]", e);
  });
}

export function mirrorProfile(profile: UserProfile) {
  const db = getDb();
  const uid = getCurrentUid();
  if (!db || !uid) return;
  safeCall(() =>
    setDoc(
      doc(db, "users", uid),
      { profile, updatedAt: serverTimestamp() },
      { merge: true }
    )
  );
}

export function mirrorElection(election: Election) {
  const db = getDb();
  const uid = getCurrentUid();
  if (!db || !uid) return;
  safeCall(() =>
    setDoc(doc(db, "users", uid, "elections", election.id), {
      ...election,
      savedAt: serverTimestamp(),
    })
  );
}

export function mirrorWish(wish: Wish) {
  const db = getDb();
  const uid = getCurrentUid();
  if (!db || !uid) return;
  safeCall(() =>
    setDoc(doc(db, "users", uid, "wishes", wish.id), {
      ...wish,
      savedAt: serverTimestamp(),
    })
  );
}

/** 過去の悩みランキング用: テーマ選択数をインクリメント */
export function incrementThemeStat(
  themeId: string,
  label: string,
  category: string
) {
  const db = getDb();
  if (!db) return;
  safeCall(() =>
    setDoc(
      doc(db, "themeStats", themeId),
      { label, category, count: increment(1) },
      { merge: true }
    )
  );
}

/** KPI計測イベント（今日の一歩タップ・シェアなど） */
export function logKpiEvent(type: KpiEventType, themeId?: string) {
  const db = getDb();
  const uid = getCurrentUid();
  if (!db || !uid) return;
  safeCall(() =>
    setDoc(doc(collection(db, "events")), {
      uid,
      type,
      themeId: themeId ?? null,
      createdAt: serverTimestamp(),
    })
  );
}
