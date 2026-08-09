import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { Pressable, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import { FONT, useDesignScale } from "./layout";

/**
 * Figma 916:15372 のスライダー。座標はスライダー枠の左上を原点にしたアートボード単位。
 * 枠は炎(image 18)の外形にそろえてある。
 */
export const SLIDER_LEFT = -4;
export const SLIDER_TOP = 226.706;
export const SLIDER_WIDTH = 343.4;
export const SLIDER_HEIGHT = 129;

const TRACK = { left: 64.185, top: 64.917, width: 279.205, height: 14.137 };
const STOP_SIZE = 32.692;
const STOP_TOP = 55.199;
/** 3段階のストップの中心x */
const STOP_CENTERS = [74.35, 199.81, 335.0];
const FLAME_WIDTH = 161.19;
const FLAME_HEIGHT = 129;
const HINT = { left: 102, top: -24, width: 140 };
const STOP_GRADIENTS = [
  ["#ffe66d", "#ffc857"],
  ["#ffc857", "#ff934f"],
  ["#ff934f", "#f4728a"],
] as const;

type MotivationSliderProps = {
  /** 0=弱い 〜 2=強い */
  level: number;
  onChange: (level: number) => void;
};

type GradientStopProps = {
  center: number;
  index: number;
  level: number;
  stopSize: number;
  stopTop: number;
  thumb: SharedValue<number>;
  onPress: () => void;
};

/** 未到達時はグレー、炎が近づくと同系色のグラデーションへ切り替わる停止点 */
function GradientStop({
  center,
  index,
  level,
  stopSize,
  stopTop,
  thumb,
  onPress,
}: GradientStopProps) {
  const reachedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      thumb.value,
      [center - stopSize * 0.45, center],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="adjustable"
      accessibilityLabel={`やる気レベル ${index + 1} / 3`}
      accessibilityState={{ selected: index === level }}
      className="bg-bubble"
      style={{
        position: "absolute",
        left: center - stopSize / 2,
        top: stopTop,
        width: stopSize,
        height: stopSize,
        borderRadius: stopSize / 2,
        overflow: "hidden",
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            inset: 0,
          },
          reachedStyle,
        ]}
      >
        <LinearGradient
          colors={STOP_GRADIENTS[index] ?? STOP_GRADIENTS[1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: stopSize, height: stopSize }}
        />
      </Animated.View>
    </Pressable>
  );
}

/** 炎をつまみにした3段階のやる気スライダー */
export function MotivationSlider({ level, onChange }: MotivationSliderProps) {
  const { s } = useDesignScale();
  const stops = STOP_CENTERS.map(s);
  const flameWidth = s(FLAME_WIDTH);
  const trackLeft = s(TRACK.left);
  const trackTop = s(TRACK.top);
  const trackWidth = s(TRACK.width);
  const trackHeight = s(TRACK.height);
  const minX = stops[0];
  const maxX = stops[stops.length - 1];
  const thumb = useSharedValue(stops[level] ?? minX);

  // ストップ直接タップ・レベルの外部変更に追従する
  useEffect(() => {
    thumb.value = withSpring(stops[level] ?? minX, {
      damping: 14,
      stiffness: 180,
    });
    // stopsは毎レンダー作り直されるので、依存は実際に変わる値だけにする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, minX, maxX]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      thumb.value = Math.min(Math.max(thumb.value + e.changeX, minX), maxX);
    })
    .onEnd(() => {
      // 指を離したら最寄りのストップにスナップする
      let nearest = 0;
      for (let i = 1; i < stops.length; i += 1) {
        if (
          Math.abs(stops[i] - thumb.value) <
          Math.abs(stops[nearest] - thumb.value)
        ) {
          nearest = i;
        }
      }
      thumb.value = withSpring(stops[nearest], {
        damping: 14,
        stiffness: 180,
      });
      runOnJS(onChange)(nearest);
    });

  const flameStyle = useAnimatedStyle(() => {
    const t = maxX > minX ? (thumb.value - minX) / (maxX - minX) : 0;
    return {
      transform: [
        { translateX: thumb.value - flameWidth / 2 },
        { scale: 0.75 + 0.25 * t },
      ],
    };
  });

  const filledTrackStyle = useAnimatedStyle(() => {
    const progress =
      maxX > minX ? (thumb.value - minX) / (maxX - minX) : 0;
    return {
      width: trackWidth * Math.min(Math.max(progress, 0), 1),
    };
  });

  return (
    <View
      style={{
        position: "absolute",
        left: s(SLIDER_LEFT),
        top: s(SLIDER_TOP),
        width: s(SLIDER_WIDTH),
        height: s(SLIDER_HEIGHT),
      }}
    >

      <View
        className="rounded-[15px] bg-bubble"
        style={{
          position: "absolute",
          left: trackLeft,
          top: trackTop,
          width: trackWidth,
          height: trackHeight,
        }}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: trackLeft,
            top: trackTop,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            overflow: "hidden",
          },
          filledTrackStyle,
        ]}
      >
        <LinearGradient
          colors={["#ffe66d", "#ffb347", "#ff7a45", "#f4728a"]}
          locations={[0, 0.38, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: trackWidth, height: trackHeight }}
        />
      </Animated.View>

      {stops.map((center, i) => (
        <GradientStop
          key={center}
          center={center}
          index={i}
          level={level}
          stopSize={s(STOP_SIZE)}
          stopTop={s(STOP_TOP)}
          thumb={thumb}
          onPress={() => onChange(i)}
        />
      ))}

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              width: flameWidth,
              height: s(FLAME_HEIGHT),
            },
            flameStyle,
          ]}
        >
          <Image
            source={require("../../../assets/election/fire.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
