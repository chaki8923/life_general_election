import { useEffect } from "react";
import type { RefObject } from "react";
import { View as RNView } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Image } from "@/tw/image";
import { Animated } from "@/tw/animated";
import { Pressable, Text, View } from "@/tw";
import type { PosterSettings } from "@/types";
import type { PosterLevel } from "./level";
import { POSTER_LEVEL_META } from "./level";
import { getPosterImageUri } from "./poster-settings";
import { POSTER_ASPECT_RATIO, type PosterPalette } from "./templates";
import { usePosterParallax } from "./use-poster-parallax";

const DEFAULT_CHARACTER = require("../../../assets/poster/default-character.png");
const ACTION_CHARACTER = require("../../../assets/poster/action-character.png");
const CHARACTER_CROWD = require("../../../assets/poster/character-crowd.png");

const PARTICLES = [
  { left: "10%", top: "24%", color: "#ffc14d", delay: 0 },
  { left: "22%", top: "42%", color: "#ffffff", delay: 220 },
  { left: "38%", top: "20%", color: "#ed5b7f", delay: 440 },
  { left: "54%", top: "47%", color: "#7bb4ea", delay: 660 },
  { left: "70%", top: "26%", color: "#ffffff", delay: 880 },
  { left: "84%", top: "40%", color: "#ffc14d", delay: 1100 },
] as const;

type Props = {
  settings: PosterSettings;
  slogan: string;
  palette: PosterPalette;
  level: PosterLevel;
  posterRef?: RefObject<RNView | null>;
  onPhotoLoaded?: () => void;
  onPressPhoto?: () => void;
  interactive?: boolean;
};

function Particle({
  left,
  top,
  color,
  delay,
  animate,
}: (typeof PARTICLES)[number] & { animate: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !animate) {
      progress.value = 0;
      return;
    }
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [animate, delay, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion || !animate ? 0.55 : 0.2 + progress.value * 0.75,
    transform: [
      { translateY: reduceMotion || !animate ? 0 : -10 * progress.value },
      { rotate: `${progress.value * 45}deg` },
      { scale: 0.7 + progress.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      className="absolute h-2.5 w-2.5"
      style={[{ left, top, backgroundColor: color }, style]}
    />
  );
}

function PatternOverlay({ level }: { level: PosterLevel }) {
  if (level < 4) return null;
  return (
    <View className="absolute inset-0 opacity-20">
      {Array.from({ length: 12 }, (_, index) => (
        <View
          key={index}
          className="absolute h-16 w-16 rotate-45 border border-white/40"
          style={{
            left: `${(index % 4) * 31 - 10}%`,
            top: `${Math.floor(index / 4) * 35 - 4}%`,
          }}
        />
      ))}
    </View>
  );
}

function CandidateImage({
  settings,
  level,
  onPhotoLoaded,
}: Pick<Props, "settings" | "level" | "onPhotoLoaded">) {
  // 写真もAI生成画像も同じ扱い（cover配置・blendなし）。既定キャラだけ別
  const uri = getPosterImageUri(settings.image);
  const showPhoto = uri !== undefined;
  const source = uri ?? (level >= 3 ? ACTION_CHARACTER : DEFAULT_CHARACTER);
  const image = (
    <Image
      source={source}
      className="h-full w-full"
      contentFit={showPhoto ? "cover" : "contain"}
      onLoadEnd={onPhotoLoaded}
      style={
        {
          filter: level <= 1 ? "grayscale(1) contrast(0.9)" : undefined,
          opacity: level === 0 ? 0.52 : 1,
          mixBlendMode: showPhoto ? "normal" : "multiply",
          transform: [{ scale: level >= 4 ? 1.04 : 1 }],
        } as never
      }
    />
  );

  return (
    <View
      className="absolute inset-x-[8%] bottom-[17%] top-[22%] overflow-hidden"
      style={{
        borderRadius: level <= 1 ? 2 : level >= 4 ? 28 : 10,
        boxShadow:
          level >= 4 ? "0 12px 24px rgba(0,0,0,0.35)" : undefined,
        backgroundColor: level === 0 ? "#d2cec5" : "#fffdf8",
      }}
    >
      {image}
    </View>
  );
}

function backgroundStyle(level: PosterLevel, palette: PosterPalette) {
  if (level === 0) return { backgroundColor: "#d8ccb4" };
  if (level === 1) return { backgroundColor: "#ffffff" };
  if (level === 2) return { backgroundColor: palette.primary };
  if (level === 3) {
    return {
      backgroundColor: palette.primary,
      experimental_backgroundImage: `linear-gradient(145deg, ${palette.primary} 0%, ${palette.secondary} 62%, #fff4d5 100%)`,
    };
  }
  if (level === 4) {
    return {
      backgroundColor: palette.secondary,
      experimental_backgroundImage: `linear-gradient(125deg, #1c2435 0%, ${palette.primary} 42%, #e9d38b 72%, ${palette.secondary} 100%)`,
    };
  }
  return {
    backgroundColor: "#11192b",
    experimental_backgroundImage:
      level === 6
        ? `radial-gradient(circle at 50% 38%, #fffbd0 0%, ${palette.accent} 16%, ${palette.primary} 42%, #0d1325 76%)`
        : `linear-gradient(145deg, #0b1020 0%, ${palette.secondary} 46%, ${palette.primary} 100%)`,
  };
}

export function PosterCanvas({
  settings,
  slogan,
  palette,
  level,
  posterRef,
  onPhotoLoaded,
  onPressPhoto,
  interactive = false,
}: Props) {
  const { animatedStyle, interactionProps } = usePosterParallax(
    interactive && level === 6
  );
  const meta = POSTER_LEVEL_META[level];
  const name = settings.candidateName || "あなた";
  const content = (
    <Animated.View
      className="flex-1 overflow-hidden"
      style={[backgroundStyle(level, palette), animatedStyle]}
      {...(interactionProps as object)}
    >
      {level >= 5 ? (
        <Image
          source={CHARACTER_CROWD}
          className="absolute inset-x-0 bottom-[14%] h-[46%] w-full opacity-25"
          contentFit="cover"
          style={{ mixBlendMode: "screen" } as never}
        />
      ) : null}
      <PatternOverlay level={level} />
      {level >= 5
        ? PARTICLES.map((particle) => (
            <Particle
              key={`${particle.left}-${particle.top}`}
              {...particle}
              animate={interactive}
            />
          ))
        : null}

      {level === 0 ? (
        <>
          <View className="absolute inset-0 border-[10px] border-[#c2b496]" />
          <View className="absolute left-[-15%] top-[45%] h-px w-[130%] rotate-[-4deg] bg-[#837964]/25" />
          <View className="absolute left-[-15%] top-[48%] h-px w-[130%] rotate-[3deg] bg-[#837964]/20" />
        </>
      ) : null}

      <View
        className="absolute inset-x-0 top-0 px-4 pb-3 pt-3"
        style={{
          backgroundColor:
            level <= 1
              ? "rgba(255,255,255,0.88)"
              : level === 2
                ? palette.secondary
                : "rgba(8,14,28,0.76)",
          borderBottomWidth: level >= 4 ? 2 : 0,
          borderBottomColor: palette.accent,
          transform: level === 0 ? [{ rotate: "-1deg" }] : undefined,
        }}
      >
        <Text
          className="text-[9px] font-bold tracking-[3px]"
          style={{ color: level <= 1 ? "#55504a" : palette.accent }}
        >
          わたしの人生公約
        </Text>
        <Text
          className="mt-1 font-black"
          style={{
            color: level === 0 ? "#27231e" : level === 1 ? "#111111" : "#ffffff",
            fontSize: level <= 1 ? 23 : 26,
            lineHeight: 32,
            fontFamily: level === 0 ? "monospace" : undefined,
            textShadowColor:
              level >= 3 ? "rgba(0,0,0,0.75)" : "transparent",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: level >= 3 ? 4 : 0,
          }}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.58}
        >
          {slogan || "ここに公約が入ります"}
        </Text>
      </View>

      <CandidateImage
        settings={settings}
        level={level}
        onPhotoLoaded={onPhotoLoaded}
      />
      {onPressPhoto ? (
        <Pressable
          onPress={onPressPhoto}
          className="absolute inset-x-[8%] bottom-[17%] top-[22%]"
        />
      ) : null}

      {level >= 3 ? (
        <View
          className="absolute right-3 top-[25%] rounded-full px-3 py-1.5"
          style={{
            backgroundColor: level >= 5 ? "#f7d978" : palette.accent,
            boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
          }}
        >
          <Text className="text-[9px] font-black text-[#222222]">
            {level >= 6 ? "LEGEND" : level >= 4 ? "1000人公認" : "注目候補"}
          </Text>
        </View>
      ) : null}

      <View
        className="absolute inset-x-0 bottom-0 items-center px-4 pb-3 pt-2"
        style={{
          backgroundColor:
            level === 0
              ? "rgba(216,204,180,0.96)"
              : level === 1
                ? "#ffffff"
                : level >= 5
                  ? "rgba(10,15,30,0.88)"
                  : palette.secondary,
          borderTopWidth: level >= 2 ? 2 : 1,
          borderTopColor: level >= 2 ? palette.accent : "#252525",
        }}
      >
        <Text
          className="text-[8px] font-bold tracking-[2px]"
          style={{ color: level <= 1 ? "#555555" : palette.accent }}
        >
          LV.{level} {meta.title} ・ 人生総選挙党
        </Text>
        <Text
          className="font-black"
          style={{
            color: level === 0 ? "#1d1a16" : level === 1 ? "#111111" : "#ffffff",
            fontSize: 38,
            lineHeight: 46,
            letterSpacing: level >= 2 ? 2 : 0,
            fontFamily: level === 0 ? "monospace" : undefined,
            textShadowColor:
              level >= 5 ? palette.accent : level >= 3 ? "#000000" : "transparent",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: level >= 5 ? 8 : level >= 3 ? 2 : 0,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {name}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <RNView
      ref={posterRef}
      collapsable={false}
      style={{
        width: "100%",
        aspectRatio: POSTER_ASPECT_RATIO,
        borderRadius: level >= 4 ? 18 : level === 0 ? 2 : 8,
        overflow: "hidden",
        borderWidth: level === 0 ? 1 : level >= 4 ? 3 : 2,
        borderColor:
          level === 0 ? "#5e5547" : level >= 4 ? palette.accent : "#242424",
        boxShadow:
          level >= 4
            ? `0 16px 32px ${palette.primary}55`
            : "0 4px 12px rgba(0,0,0,0.16)",
      }}
    >
      {content}
    </RNView>
  );
}
