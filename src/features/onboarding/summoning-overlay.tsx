import { useState } from "react";
import { VideoView } from "expo-video";
import { useReducedMotion } from "react-native-reanimated";
import { INTEREST_IMAGES } from "@/constants/interests";
import { useDesignScale } from "@/features/election/layout";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { Text, View } from "@/tw";

/** Figma 2546:2445「main_1 2」。行進する動画が敷かれた矩形（x:0 y:89 / 390×693） */
const VIDEO_TOP = 89;
const VIDEO_HEIGHT = 693;

/**
 * Figma 1700:7742 — プロフィール登録直後、選挙フローへ渡すまでの招集演出。
 * 画面遷移ではなく登録画面のフェーズとして出す（worry-confirm-modalと同じ考え方）。
 */
export function SummoningOverlay() {
  const { s, width } = useDesignScale();
  const reducedMotion = useReducedMotion();
  // ルートで先に作ってあるプレイヤーを借りる。演出は2.2秒しかないので出足を稼ぐ
  const player = useBackgroundVideo("summoning", { play: !reducedMotion });
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);

  // この演出の直後がお悩み選択。2.2秒あるうちにカードの画像を読み終えておく
  usePreloadImages(INTEREST_IMAGES);

  return (
    <View className="flex-1 bg-white">
      {/* 見出しは動画の白地に重ねるので、先に敷いて後ろへ回す */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          top: s(VIDEO_TOP),
          width,
          height: s(VIDEO_HEIGHT),
        }}
      >
        <VideoView
          player={player}
          // 最初のフレームが出るまで透明にして、黒い矩形が一瞬見えるのを防ぐ
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

      <Text
        className="text-center font-flow text-flow-ink"
        style={{ marginTop: s(218), fontSize: s(28), lineHeight: s(44) }}
      >
        {"あなたに近い\nとぴょっこを\n招集しています…"}
      </Text>
    </View>
  );
}
