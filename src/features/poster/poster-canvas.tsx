import type { RefObject } from "react";
import { View as RNView } from "react-native";
import { Pressable, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { StrokedVerticalText } from "./stroked-vertical-text";
import { POSTER_ASPECT_RATIO, type PosterPalette } from "./templates";
import { VerticalText } from "./vertical-text";

type Props = {
  photoUri: string | null;
  name: string;
  slogan: string;
  palette: PosterPalette;
  /** view-shotのキャプチャ対象。RN coreのViewである必要がある */
  posterRef: RefObject<RNView | null>;
  /** expo-imageは非同期デコードのため、ロード完了前のキャプチャは空写真になる */
  onPhotoLoaded: () => void;
  onPressPhoto: () => void;
};

export function PosterCanvas({
  photoUri,
  name,
  slogan,
  palette,
  posterRef,
  onPhotoLoaded,
  onPressPhoto,
}: Props) {
  return (
    // Androidで最適化によりViewがフラット化されるとキャプチャが空になるため
    // collapsable={false} が必須
    <RNView
      ref={posterRef}
      collapsable={false}
      style={{ width: "100%", aspectRatio: POSTER_ASPECT_RATIO }}
    >
      <View className="flex-1 overflow-hidden rounded-sm border-[3px] border-election-gold bg-election-paper">
        {/* 顔写真 or プレースホルダ。上帯~22% + 下帯~16% を除いた中央が顔の可視域 */}
        {photoUri ? (
          <Image
            source={photoUri}
            className="absolute inset-0 object-cover"
            onLoadEnd={onPhotoLoaded}
          />
        ) : (
          <Pressable
            onPress={onPressPhoto}
            className="absolute inset-0 items-center justify-center bg-election-navy"
          >
            <Text className="text-5xl">📷</Text>
            <Text className="mt-3 text-sm font-bold text-white/80">
              タップして写真を選ぶ
            </Text>
          </Pressable>
        )}

        {/* 上部・公約帯 */}
        <View
          className={`absolute inset-x-0 top-0 border-b-2 border-election-gold px-4 pb-3 pt-2.5 ${palette.band}`}
        >
          <Text className="text-[10px] font-bold tracking-[4px] text-white/70">
            わたしの公約
          </Text>
          <Text
            className="mt-1 font-black text-white"
            style={{
              fontSize: 26,
              lineHeight: 34,
              textShadowColor: "rgba(0,0,0,0.35)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 3,
            }}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {slogan || "ここに公約が入ります"}
          </Text>
        </View>

        {/* 右側・縦書き名前(縁取り付きで写真に直接載せる) */}
        {name !== "" && (
          <View className="absolute right-3 top-[24%]">
            <StrokedVerticalText
              text={name}
              fontSize={[...name].length > 5 ? 28 : 40}
              fillClassName="text-white"
              strokeClassName={palette.nameStroke}
            />
          </View>
        )}

        {/* 必勝シール(hanko風) */}
        <View
          className="absolute left-3 top-[24%] h-16 w-16 items-center justify-center rounded-full border-[3px] border-election-red bg-election-paper"
          style={{ transform: [{ rotate: "-8deg" }] }}
        >
          <VerticalText
            text="必勝"
            fontSize={18}
            className="font-black text-election-red"
          />
        </View>

        {/* 下部・名前帯(ポスターの主役) */}
        <View
          className={`absolute inset-x-0 bottom-0 items-center border-t-2 border-election-gold px-4 pb-2.5 pt-1.5 ${palette.bottom}`}
        >
          <Text className="text-[9px] font-bold tracking-[3px] text-election-gold">
            🗳️ 1000人生総選挙 公認候補
          </Text>
          <Text
            className="font-black text-white"
            style={{ fontSize: 40, lineHeight: 48, letterSpacing: 2 }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {name || "本人"}
          </Text>
        </View>
      </View>
    </RNView>
  );
}
