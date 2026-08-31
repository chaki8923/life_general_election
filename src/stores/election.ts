import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Election, Worry, WorrySuggestion } from "@/types";

/** 再開票に要る一式。election は新しい順に間引くときのキー（createdAt）にも使う */
type ArchivedElection = {
  worry: Worry;
  motivation: string;
  election: Election;
};

/**
 * 保持する開票結果の件数。1回分が候補6〜8件で約1KB。
 * 結果を記録するたびに再開票して1件積まれるので、
 * 1本の悩みを追いかけ続けても枠を使い切らない程度に持つ。
 */
const HISTORY_LIMIT = 20;

/** 開票の新しい順に HISTORY_LIMIT 件だけ残す */
function trimHistory(history: Record<string, ArchivedElection>) {
  const entries = Object.entries(history);
  if (entries.length <= HISTORY_LIMIT) return history;
  entries.sort((a, b) => b[1].election.createdAt - a[1].election.createdAt);
  return Object.fromEntries(entries.slice(0, HISTORY_LIMIT));
}

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
  /** 今回のフローがプロフィール登録直後に始まったか */
  showProfileStep: boolean;
  /**
   * 過去の開票結果。Wish.sourceElectionId から引いて、
   * 次の政策を決めるときに悩み・モチベーションを引き継ぐために持つ
   */
  history: Record<string, ArchivedElection>;
  setInterest: (interest: string, showProfileStep?: boolean) => void;
  setWorryCandidates: (candidates: WorrySuggestion[] | null) => void;
  setWorry: (worry: Worry) => void;
  setMotivation: (motivation: string) => void;
  setElection: (election: Election | null) => void;
  /**
   * 保存済みの回の悩み・モチベーションだけ戻し、開票結果は空にして再生成させる。
   * 履歴に無ければ false
   */
  restoreForRegenerate: (electionId: string) => boolean;
};

// リセット原則: 上流をセットしたら下流をすべてnullに戻す。
// 選び直し時に前回の選挙が残らず、各画面の生成effectが再発火する。
// history だけはこの原則の対象外で、過去の開票結果を貯めるアーカイブとして残す。
// 永続化するのも history だけにする（worry/motivation/election まで永続化すると
// ハイドレート待ちの数十msだけ null に見えて、各画面のガードが誤発火する）。
export const useElectionStore = create<ElectionStore>()(
  persist(
    (set, get) => ({
      interest: null,
      worryCandidates: null,
      worry: null,
      motivation: null,
      election: null,
      showProfileStep: false,
      history: {},
      setInterest: (interest, showProfileStep = false) =>
        set({
          interest,
          worryCandidates: null,
          worry: null,
          motivation: null,
          election: null,
          showProfileStep,
        }),
      setWorryCandidates: (worryCandidates) => set({ worryCandidates }),
      setWorry: (worry) => set({ worry, motivation: null, election: null }),
      setMotivation: (motivation) => set({ motivation, election: null }),
      setElection: (election) =>
        set((state) => {
          // 開票できた回だけ、あとで戻れるようにアーカイブへ写す
          if (!election || !state.worry || !state.motivation) {
            return { election };
          }
          return {
            election,
            history: trimHistory({
              ...state.history,
              [election.id]: {
                worry: state.worry,
                motivation: state.motivation,
                election,
              },
            }),
          };
        }),
      restoreForRegenerate: (electionId) => {
        const entry = get().history[electionId];
        if (!entry) return false;
        set({
          worry: entry.worry,
          motivation: entry.motivation,
          // 開票結果だけ空にして、counting画面の生成effectを再発火させる
          election: null,
          // 前回の続きから選び直すだけなので、オンボーディング演出は畳む
          showProfileStep: false,
        });
        return true;
      },
    }),
    {
      name: "lge-election-history",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ history: s.history }),
    }
  )
);
