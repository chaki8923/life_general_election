import { create } from "zustand";
import type { Election, Worry } from "@/types";

type ElectionStore = {
  /** いま総選挙を開催中の悩み */
  worry: Worry | null;
  /** 生成された開票結果 */
  election: Election | null;
  setWorry: (worry: Worry) => void;
  setElection: (election: Election | null) => void;
};

export const useElectionStore = create<ElectionStore>((set) => ({
  worry: null,
  election: null,
  setWorry: (worry) => set({ worry, election: null }),
  setElection: (election) => set({ election }),
}));
