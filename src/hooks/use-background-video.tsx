import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, type VideoPlayer } from "expo-video";

export type BackgroundVideoId =
  | "electionTop"
  | "counting"
  | "achievementWalk"
  | "summoning";

type BackgroundVideoOptions = {
  /** falseの間は再生しない（「視差効果を減らす」設定など） */
  play?: boolean;
};

type BackgroundVideoPlayers = Record<BackgroundVideoId, VideoPlayer>;

const BackgroundVideoContext = createContext<BackgroundVideoPlayers | null>(null);

const electionTopSource = require("../../assets/video/walk_baby.mp4");
const countingSource = require("../../assets/video/vort_complete.mp4");
const achievementWalkSource = require(
  "../../assets/video/character-walk-in-place-right-v3.mp4"
);
const summoningSource = require("../../assets/video/summoning.mp4");

function configureBackgroundVideo(player: VideoPlayer) {
  player.loop = true;
  player.muted = true;
}

/**
 * 全ての装飾動画をルートで一度だけ作成する。
 * VideoViewに接続される前にバッファが準備され、画面遷移後の初回再生を早められる。
 */
export function BackgroundVideoProvider({ children }: PropsWithChildren) {
  const electionTop = useVideoPlayer(electionTopSource, configureBackgroundVideo);
  const counting = useVideoPlayer(countingSource, configureBackgroundVideo);
  const achievementWalk = useVideoPlayer(
    achievementWalkSource,
    configureBackgroundVideo
  );
  const summoning = useVideoPlayer(summoningSource, configureBackgroundVideo);

  const players = useMemo(
    () => ({ electionTop, counting, achievementWalk, summoning }),
    [electionTop, counting, achievementWalk, summoning]
  );

  return (
    <BackgroundVideoContext.Provider value={players}>
      {children}
    </BackgroundVideoContext.Provider>
  );
}

/**
 * 事前に作成した装飾用プレイヤーを取得し、画面フォーカスと再生を同期する。
 * 画面から離れている間は停止し、バッテリーを消費しない。
 */
export function useBackgroundVideo(
  id: BackgroundVideoId,
  { play = true }: BackgroundVideoOptions = {}
): VideoPlayer {
  const players = useContext(BackgroundVideoContext);
  if (!players) {
    throw new Error(
      "useBackgroundVideo must be used within BackgroundVideoProvider"
    );
  }

  const player = players[id];
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!play) {
        player.pause();
        return;
      }

      player.play();
      return () => {
        if (mounted.current) player.pause();
      };
    }, [player, play])
  );

  return player;
}
