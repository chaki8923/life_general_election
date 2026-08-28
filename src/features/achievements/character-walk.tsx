import { useState } from "react";
import { VideoView } from "expo-video";
import { useDesignScale } from "@/features/election/layout";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { View } from "@/tw";

type CharacterWalkProps = {
  /** ヒーロー領域の高さ（幅は画面いっぱい） */
  height?: number;
};

/** 画面上端からのオフセット（デザインpx） */
const HERO_TOP_OFFSET = 8;

/**
 * 実績画面のヒーロー。歩き続けるキャラクターをループ再生する。
 */
export function CharacterWalk({ height = 240 }: CharacterWalkProps) {
  const { s } = useDesignScale();
  const player = useBackgroundVideo("achievementWalk");
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);

  return (
    <View
      className="w-full overflow-hidden bg-[#fdf6e8]"
      style={{ height, marginTop: s(HERO_TOP_OFFSET) }}
    >
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
        accessibilityLabel="歩き続けるキャラクター"
        onFirstFrameRender={() => setHasRenderedFirstFrame(true)}
      />
    </View>
  );
}
