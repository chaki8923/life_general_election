import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { generateElection } from "@/features/election/generate";
import { selectPastPledgeResults } from "@/features/election/past-pledge-results";
import { mirrorElection } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import type { Wish } from "@/types";

/**
 * 先読みに割く上限。generateJson は失敗もタイムアウトもmockで吸収して必ず解決するため、
 * 待ち続けると最大30秒スピナーが回る。超えたら開票演出に任せてボタンを解放する。
 */
const MAX_PREFETCH_WAIT_MS = 8000;

/**
 * 完了画面で次の開票を先読みし、「次の政策を決めよう！」の遷移を返すフック。
 * 画面を開いた時点で生成を始めるので、ボタンを押す頃には結果が揃っていて
 * 開票演出（counting）を挟まずに投票結果画面へ飛べる。
 */
export function useNextPolicy(wish: Wish | undefined) {
  const router = useRouter();
  const worry = useElectionStore((state) => state.worry);
  const motivation = useElectionStore((state) => state.motivation);
  const election = useElectionStore((state) => state.election);
  const setElection = useElectionStore((state) => state.setElection);
  const restoreForRegenerate = useElectionStore(
    (state) => state.restoreForRegenerate
  );
  const profile = useProfileStore((state) => state.profile);
  const wishes = useWishStore((state) => state.wishes);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const sourceElectionId = wish?.sourceElectionId;
  // 開票をやり直す元になる回。setElection で新しい回が積まれても
  // 既存エントリの参照は変わらないので、これをeffectの依存に使っても再発火しない
  const archived = useElectionStore((state) =>
    sourceElectionId ? state.history[sourceElectionId] : undefined
  );

  // 画面に入った時点で前回の悩み・モチベーションを「いまの選挙」に戻す。
  // election が null に戻るので、下の生成effectが走る。
  useEffect(() => {
    if (!sourceElectionId || !archived) return;
    restoreForRegenerate(sourceElectionId);
  }, [sourceElectionId, archived, restoreForRegenerate]);

  // 配列を作り直すとdepsが毎レンダー変わって生成が止まらなくなるので、必ずメモ化する
  const pastResults = useMemo(() => selectPastPledgeResults(wishes), [wishes]);

  // counting.tsx と同じ開票生成。ここで先に済ませておくことで演出を挟まずに結果へ飛べる
  useEffect(() => {
    if (!archived || !worry || !motivation || !profile || election) return;
    let cancelled = false;
    setFailed(false);
    setTimedOut(false);
    // 待たせすぎたらボタンだけ先に押せるようにする（timedOutはdepsに入れない）
    const budget = setTimeout(() => {
      if (!cancelled) setTimedOut(true);
    }, MAX_PREFETCH_WAIT_MS);
    generateElection({ worry, profile, motivation, pastResults })
      .then((generated) => {
        if (cancelled) return;
        setElection(generated);
        mirrorElection(generated);
      })
      .catch((error) => {
        if (__DEV__) console.warn("[election/next-policy]", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(budget);
    };
  }, [
    archived,
    worry,
    motivation,
    profile,
    election,
    pastResults,
    setElection,
  ]);

  const handleNext = () => {
    // アーカイブが無い（開票結果を保存する前に作られた公約）ときは総選挙からやり直す
    if (!archived) {
      router.replace("/election");
      return;
    }
    // 先読みが間に合っていれば開票演出を飛ばして結果へ
    if (election) {
      router.replace("/election/result");
      return;
    }
    // 失敗したか、先読みが間に合わなかったとき。開票演出と生成をcountingに任せる
    router.replace("/election/counting");
  };

  return {
    loading: Boolean(archived) && !election && !failed && !timedOut,
    handleNext,
  };
}
