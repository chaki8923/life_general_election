import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** AIアバターの1日あたり生成上限。画像生成は無料枠がなく1枚ごとに課金されるため設ける */
export const AI_AVATAR_DAILY_LIMIT = 3;

/** 端末ローカルの日付（YYYY-MM-DD）。UTCだと日本時間の日付変更とズレるのでローカル基準 */
function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

type AiUsageStore = {
  /** countを数えている日付 */
  date: string;
  count: number;
  /** 顔写真をAIへ送ることへの同意。写真を使う生成の初回だけ確認する */
  avatarConsent: boolean;
  /** AsyncStorageからの復元完了フラグ */
  hasHydrated: boolean;
  /** 本日の残り生成回数 */
  remainingToday: () => number;
  /** 上限内なら1回消費してtrue。上限に達していればfalse */
  consume: () => boolean;
  grantConsent: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useAiUsageStore = create<AiUsageStore>()(
  persist(
    (set, get) => ({
      date: today(),
      count: 0,
      avatarConsent: false,
      hasHydrated: false,
      remainingToday: () => {
        const state = get();
        // 日付が変わっていればカウントはリセット済みとみなす
        const used = state.date === today() ? state.count : 0;
        return Math.max(0, AI_AVATAR_DAILY_LIMIT - used);
      },
      consume: () => {
        const state = get();
        const isToday = state.date === today();
        const used = isToday ? state.count : 0;
        if (used >= AI_AVATAR_DAILY_LIMIT) return false;
        set({ date: today(), count: used + 1 });
        return true;
      },
      grantConsent: () => set({ avatarConsent: true }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "lge-ai-usage",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        date: s.date,
        count: s.count,
        avatarConsent: s.avatarConsent,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
