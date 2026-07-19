import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Wish } from "@/types";

type WishInput = {
  text: string;
  policy?: string;
  deadline?: number;
  sourceElectionId?: string;
};

type WishStore = {
  /** 保存済みの人生公約(新しい順) */
  wishes: Wish[];
  /** AsyncStorageからの復元完了フラグ。復元前に「公約なし」と誤判定しないため */
  hasHydrated: boolean;
  /** 追加したWishを返す。同一text+sourceElectionIdが既にあれば既存を返す */
  addWish: (input: WishInput) => Wish;
  markDone: (id: string) => Wish | undefined;
  markExcused: (id: string, excuse: string) => Wish | undefined;
  setHasHydrated: (v: boolean) => void;
};

export const useWishStore = create<WishStore>()(
  persist(
    (set, get) => ({
      wishes: [],
      hasHydrated: false,
      addWish: (input) => {
        const existing = get().wishes.find(
          (w) =>
            w.text === input.text &&
            w.sourceElectionId === input.sourceElectionId
        );
        if (existing) return existing;
        const wish: Wish = {
          // 同画面での連続タップでも衝突しないようランダムサフィックスを付ける
          id: `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          text: input.text,
          ...(input.policy !== undefined ? { policy: input.policy } : {}),
          ...(input.deadline !== undefined ? { deadline: input.deadline } : {}),
          ...(input.sourceElectionId !== undefined
            ? { sourceElectionId: input.sourceElectionId }
            : {}),
          status: "active",
          createdAt: Date.now(),
        };
        set({ wishes: [wish, ...get().wishes] });
        return wish;
      },
      markDone: (id) => {
        const current = get().wishes.find((wish) => wish.id === id);
        if (!current) return undefined;
        const updated: Wish = {
          ...current,
          status: "done",
          doneAt: Date.now(),
        };
        set({
          wishes: get().wishes.map((wish) =>
            wish.id === id ? updated : wish
          ),
        });
        return updated;
      },
      markExcused: (id, excuse) => {
        const current = get().wishes.find((wish) => wish.id === id);
        if (!current) return undefined;
        const updated: Wish = {
          ...current,
          status: "excused",
          excuse,
          excusedAt: Date.now(),
        };
        set({
          wishes: get().wishes.map((wish) =>
            wish.id === id ? updated : wish
          ),
        });
        return updated;
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "lge-wishes",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ wishes: s.wishes }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
