import type { RefObject } from "react";
import { useState } from "react";
import { View as RNView } from "react-native";
import { getPresetAvatarSource } from "@/features/avatar/preset-avatars";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { PosterSettings } from "@/types";
import { getPosterImageUri } from "./poster-settings";
import {
  NAME_BAND_HEIGHT,
  NAME_BAND_TOP,
  POSTER_HEIGHT,
  POSTER_WIDTH,
  type PosterPalette,
} from "./templates";
import { VerticalSlogan } from "./vertical-slogan";

const DEFAULT_CHARACTER = require("../../../assets/poster/default-character.webp");

/** 以下すべて Figma 2040:6126 Avatar-Frame（350×400）基準の座標 */
const CARD_RADIUS = 16;
/** 候補者画像（Figma 2040:6127「オブジェクト」）。下端はカード外にはみ出す */
const IMAGE_LEFT = 126;
const IMAGE_WIDTH = 273;
/** イラスト（既製アバター・既定キャラ）はFigma実測どおり上に30空ける */
const ART_TOP = 30;
const ART_HEIGHT = 381;
/**
 * 実写は上に残るピンク地が目立つのでカード上端まで詰める。
 * 下端（30+381=411）は動かしたくないので、詰めたぶんを高さで吸収する。
 */
const PHOTO_TOP = 0;
const PHOTO_HEIGHT = ART_TOP + ART_HEIGHT;
/** 氏名帯の位置・高さは templates.ts（スローガン側と共有） */
const NAME_FONT_SIZE = 24;
const NAME_LINE_HEIGHT = NAME_FONT_SIZE * 1.4;

type Props = {
  settings: PosterSettings;
  slogan: string;
  palette: PosterPalette;
  /** view-shot のキャプチャ対象 */
  posterRef?: RefObject<RNView | null>;
  onPhotoLoaded?: () => void;
  onPressPhoto?: () => void;
  interactive?: boolean;
};

/**
 * ポスター本体（Figma 2040:6126）。
 * 地色のカードに、右へ寄せた候補者画像・左の縦書きスローガン・下端の氏名帯を重ねる。
 */
export function PosterCanvas({
  settings,
  slogan,
  palette,
  posterRef,
  onPhotoLoaded,
  onPressPhoto,
  interactive = true,
}: Props) {
  // 実幅が決まるまで描かない。アートボード基準の座標を実寸へ換算するため
  const [width, setWidth] = useState(0);
  const s = (value: number) => (value * width) / POSTER_WIDTH;

  const uri = getPosterImageUri(settings.image);
  const presetSource =
    settings.image.kind === "preset"
      ? getPresetAvatarSource(settings.image.id)
      : undefined;
  // 実写だけ枠いっぱいに敷く。イラストは全身が入るようcontainで収める
  const showPhoto = uri !== undefined;
  const name = settings.candidateName || "あなた";
  // 画像本体と差し替え用の当たり判定で共有する（片方だけ直すとズレるため）
  const imageFrame = {
    position: "absolute" as const,
    left: s(IMAGE_LEFT),
    top: s(showPhoto ? PHOTO_TOP : ART_TOP),
    width: s(IMAGE_WIDTH),
    height: s(showPhoto ? PHOTO_HEIGHT : ART_HEIGHT),
  };

  return (
    <RNView
      ref={posterRef}
      // Androidでview-shotが空画像を返さないようビューを畳ませない
      collapsable={false}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        width: "100%",
        aspectRatio: POSTER_WIDTH / POSTER_HEIGHT,
        borderRadius: s(CARD_RADIUS),
        overflow: "hidden",
        backgroundColor: palette.surface,
      }}
    >
      {width === 0 ? null : (
        <>
          <View style={imageFrame}>
            <Image
              source={uri ?? presetSource ?? DEFAULT_CHARACTER}
              className="h-full w-full"
              contentFit={showPhoto ? "cover" : "contain"}
              onLoadEnd={onPhotoLoaded}
            />
          </View>

          {/* 写真の差し替えはカード面のどこを押しても始められる */}
          {onPressPhoto ? (
            <Pressable
              onPress={interactive ? onPressPhoto : undefined}
              accessibilityRole="button"
              accessibilityLabel="候補者の写真を変更する"
              style={imageFrame}
            />
          ) : null}

          <VerticalSlogan
            text={slogan}
            s={s}
            fillColor="#ffffff"
            strokeColor={palette.stroke}
          />

          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: s(NAME_BAND_TOP),
              height: s(NAME_BAND_HEIGHT),
              backgroundColor: palette.primary,
              justifyContent: "center",
            }}
          >
            <Text
              numberOfLines={1}
              className="text-center font-flow text-white"
              style={{
                fontSize: s(NAME_FONT_SIZE),
                lineHeight: s(NAME_LINE_HEIGHT),
              }}
            >
              {name}
            </Text>
          </View>
        </>
      )}
    </RNView>
  );
}
