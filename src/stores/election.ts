import { create } from "zustand";
import type { Election, Worry, WorrySuggestion } from "@/types";

type ElectionStore = {
  /** 選択した興味関心カテゴリ（label） */
  interest: string | null;
  /** AIが提案した悩み候補。null=未生成（worries画面がローディング表示する根拠） */
  worryCandidates: WorrySuggestion[] | null;
  /** いま総選挙を開催中の悩み */
  worry: Worry | null;
  /** 今回の選挙で選んだモチベーション（label） */
  motivation: string | null;
  /** 生成された開票結果 */
  election: Election | null;
  setInterest: (interest: string) => void;
  setWorryCandidates: (candidates: WorrySuggestion[] | null) => void;
  setWorry: (worry: Worry) => void;
  setMotivation: (motivation: string) => void;
  setElection: (election: Election | null) => void;
};

// リセット原則: 上流をセットしたら下流をすべてnullに戻す。
// 選び直し時に前回の選挙が残らず、各画面の生成effectが再発火する。
export const useElectionStore = create<ElectionStore>((set) => ({
  interest: null,
  worryCandidates: null,
  worry: null,
  motivation: null,
  election: null,
  setInterest: (interest) =>
    set({
      interest,
      worryCandidates: null,
      worry: null,
      motivation: null,
      election: null,
    }),
  setWorryCandidates: (worryCandidates) => set({ worryCandidates }),
  setWorry: (worry) => set({ worry, motivation: null, election: null }),
  setMotivation: (motivation) => set({ motivation, election: null }),
  setElection: (election) => set({ election }),
}));
