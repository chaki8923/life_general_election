import { VideoView } from "expo-video";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { View } from "@/tw";

const walkVideo = require("../../../assets/video/character-walk-in-place-right-v3.mp4");

type CharacterWalkProps = {
  /** ヒーロー領域の高さ（幅は画面いっぱい） */
  height?: number;
};

/**
 * 実績画面のヒーロー。歩き続けるキャラクターをループ再生する。
 */
export function CharacterWalk({ height = 240 }: CharacterWalkProps) {
  const player = useBackgroundVideo(walkVideo);

  return (
    <View className="w-full overflow-hidden bg-[#fdf6e8]" style={{ height }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        accessibilityLabel="歩き続けるキャラクター"
      />
    </View>
  );
}
