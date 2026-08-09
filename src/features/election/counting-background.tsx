import { useState } from "react";
import { VideoView } from "expo-video";
import { useReducedMotion } from "react-native-reanimated";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { View } from "@/tw";

/**
 * 開票中の背景（Figma注記の「動く背景」）。静止画 arena.png の置き換え。
 * 装飾なので読み上げ対象にせず、前面のタップも邪魔しない。
 */
export function CountingBackground() {
  const reduceMotion = useReducedMotion();
  const player = useBackgroundVideo("counting", { play: !reduceMotion });
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: "100%",
          opacity: hasRenderedFirstFrame ? 1 : 0,
        }}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        onFirstFrameRender={() => setHasRenderedFirstFrame(true)}
      />
    </View>
  );
}
