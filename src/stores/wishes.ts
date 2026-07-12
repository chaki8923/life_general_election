import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Wish } from "@/types";

type WishInput = {
  text: string;
  sourceElectionId?: string;
};

type WishStore = {
  /** 保存済みの人生公約(新しい順) */
  wishes: Wish[];
  /** AsyncStorageからの復元完了フラグ。復元前に「公約なし」と誤判定しないため */
  hasHydrated: boolean;
  /** 追加したWishを返す。同一text+sourceElectionIdが既にあれば既存を返す */
  addWish: (input: WishInput) => Wish;
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
          sourceElectionId: input.sourceElectionId,
          status: "active",
          createdAt: Date.now(),
        };
        set({ wishes: [wish, ...get().wishes] });
        return wish;
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
