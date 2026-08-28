import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { deleteManagedPosterPhoto } from "@/features/poster/photo-storage";
import { createDefaultPosterSettings } from "@/features/poster/poster-settings";
import type { PosterSettings, Wish } from "@/types";

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
  /** 追加したWishを返す。同一text+sourceElectionIdの実行中Wishが既にあれば既存を返す */
  addWish: (input: WishInput) => Wish;
  markDone: (id: string) => Wish | undefined;
  /** 公約ごと削除する。ローカルのみ（Firestore側の削除APIは未実装） */
  removeWish: (id: string) => void;
  markExcused: (id: string, excuse: string) => Wish | undefined;
  setPosterSettings: (id: string, settings: PosterSettings) => Wish | undefined;
  /** @deprecated 完成画像保存のversion 1互換API */
  setPosterUri: (id: string, uri: string) => Wish | undefined;
  setHasHydrated: (v: boolean) => void;
};

/**
 * version 2以前の保存値をいまのPosterImageSourceへ寄せる。
 * version 1: posterSettings自体が無い / version 2: 廃止したAI生成画像(kind:"ai")が残る
 */
function migratePosterSettings(
  settings: PosterSettings | undefined
): PosterSettings {
  if (!settings) return createDefaultPosterSettings();
  // 型からは消えた旧kindを見るので、ここだけ緩い型で受ける
  const image = settings.image as { kind: string; uri?: string };
  if (image.kind !== "ai") return settings;
  deleteManagedPosterPhoto(image.uri);
  return { ...settings, image: { kind: "character" } };
}

export const useWishStore = create<WishStore>()(
  persist(
    (set, get) => ({
      wishes: [],
      hasHydrated: false,
      addWish: (input) => {
        // 実行中のものだけ重複扱いにする。達成済み/言い訳済みの公約を選び直したときは
        // 新しい期日で掲げ直したいので、別のWishとして作る
        const existing = get().wishes.find(
          (w) =>
            w.status === "active" &&
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
          posterSettings: createDefaultPosterSettings(),
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
      removeWish: (id) => {
        set({ wishes: get().wishes.filter((wish) => wish.id !== id) });
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
      setPosterSettings: (id, posterSettings) => {
        const current = get().wishes.find((wish) => wish.id === id);
        if (!current) return undefined;
        const updated: Wish = {
          ...current,
          posterSettings,
        };
        set({
          wishes: get().wishes.map((wish) =>
            wish.id === id ? updated : wish
          ),
        });
        return updated;
      },
      setPosterUri: (id, uri) => {
        const current = get().wishes.find((wish) => wish.id === id);
        if (!current) return undefined;
        const updated: Wish = {
          ...current,
          posterUri: uri,
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
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ wishes: s.wishes }),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<WishStore>;
        if (version >= 3 || !Array.isArray(state.wishes)) return state;
        return {
          ...state,
          wishes: state.wishes.map((wish) => ({
            ...wish,
            posterSettings: migratePosterSettings(wish.posterSettings),
          })),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
