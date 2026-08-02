import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "@/tw";

const walkVideo = require("../../../assets/video/character-walk-in-place-right-v3.mp4");

type CharacterWalkProps = {
  /** ヒーロー領域の高さ（幅は画面いっぱい） */
  height?: number;
};

/**
 * 実績画面のヒーロー。歩き続けるキャラクターをループ再生する。
 * 画面から離れている間は止めてバッテリーを浪費しない。
 */
export function CharacterWalk({ height = 240 }: CharacterWalkProps) {
  const player = useVideoPlayer(walkVideo, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => player.pause();
    }, [player])
  );

  return (
    <View className="w-full overflow-hidden bg-[#fdf6e8]" style={{ height }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        accessibilityLabel="歩き続けるキャラクター"
      />
    </View>
  );
}
