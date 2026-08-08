import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, type VideoPlayer, type VideoSource } from "expo-video";

type BackgroundVideoOptions = {
  /** falseの間は再生しない（「視差効果を減らす」設定など） */
  play?: boolean;
};

/**
 * 装飾用のループ動画プレイヤーを作る。画面から離れている間は止めてバッテリーを浪費しない。
 *
 * アンマウント時のクリーンアップは登録順に走るため、useVideoPlayerより先に
 * マウント判定を登録しておく必要がある。そうしないと
 * useVideoPlayerのrelease()が先に走り、後からpause()を呼んで
 * NativeSharedObjectNotFoundExceptionで落ちる。
 */
export function useBackgroundVideo(
  source: VideoSource,
  { play = true }: BackgroundVideoOptions = {}
): VideoPlayer {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  useFocusEffect(
    useCallback(() => {
      if (!play) {
        player.pause();
        return;
      }
      player.play();
      // アンマウント時はplayerが解放済みなので触らない。画面を離れただけなら止める。
      return () => {
        if (mounted.current) player.pause();
      };
    }, [player, play])
  );

  return player;
}
