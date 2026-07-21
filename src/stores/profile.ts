import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

type ProfileStore = {
  /** 登録済みプロフィール。null = 未登録（オンボーディングへ誘導） */
  profile: UserProfile | null;
  /** チュートリアルを最後まで見た or スキップしたか */
  tutorialSeen: boolean;
  /** AsyncStorageからの復元完了フラグ。復元前に「未登録」と誤判定しないため */
  hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  markTutorialSeen: () => void;
  setHasHydrated: (v: boolean) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      tutorialSeen: false,
      hasHydrated: false,
      setProfile: (profile) => set({ profile }),
      markTutorialSeen: () => set({ tutorialSeen: true }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "lge-profile",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile, tutorialSeen: s.tutorialSeen }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
