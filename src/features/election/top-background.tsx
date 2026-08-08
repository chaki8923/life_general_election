import { VideoView } from "expo-video";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { View } from "@/tw";

const bgVideo = require("../../../assets/video/walk_baby.mp4");

/**
 * 選挙トップの背景（Figma: TOP 1664-6457 の「後ろの人たちを動かす」）。
 * 装飾なので読み上げ対象にせず、前面のタップも邪魔しない。
 */
export function TopBackground() {
  const player = useBackgroundVideo(bgVideo);

  return (
    // Figma: 背景 opacity 61%。地の白の上に薄く重ねる
    <View pointerEvents="none" className="absolute inset-0 opacity-[0.61]">
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
    </View>
  );
}
