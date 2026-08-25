import type { RefObject } from "react";
import { View as RNView } from "react-native";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { PosterSettings } from "@/types";
import { PosterCanvas } from "./poster-canvas";
import type { PosterPalette } from "./templates";

const runningIcon = require("../../../assets/poster/icon-running.svg");
const downloadIcon = require("../../../assets/poster/icon-download.svg");
const editIcon = require("../../../assets/poster/icon-edit-inline.svg");

/** Figma 2703:24297 のカード枠線 / 編集リンクの枠線 */
const BORDER = "#f6f6f6";
const LINK_BORDER = "#d0d7de";
/**
 * ポスター本体の幅（Figma 2703:24308 Avatar-Frame 208×237.714）。
 * PosterCanvas は 350×400 のアートボードを相似縮小するので、
 * 幅を 208 にすれば高さも角丸も Figma の実測値に一致する。
 */
const POSTER_DISPLAY_WIDTH = 208;
/** 右上の保存ボタン（Figma 2703:24315 の 42.789 枠 / 30.606 アイコン） */
const SAVE_BUTTON_SIZE = 42.789;
const SAVE_ICON_SIZE = 30.606;

type Props = {
  settings: PosterSettings;
  slogan: string;
  palette: PosterPalette;
  /** view-shot のキャプチャ対象。表示中の1枚にだけ渡す */
  posterRef?: RefObject<RNView | null>;
  onPhotoLoaded?: () => void;
  onPressEdit: () => void;
  onPressSave: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
};

/** 公約ポスターカード（Figma 2703:24297 Running-Pledge-Card） */
export function PosterCard({
  settings,
  slogan,
  palette,
  posterRef,
  onPhotoLoaded,
  onPressEdit,
  onPressSave,
  saveDisabled = false,
  saving = false,
}: Props) {
  return (
    <View
      className="items-center gap-[12px] rounded-[16px] bg-white p-[20px]"
      style={{ borderWidth: 1, borderColor: BORDER }}
    >
      <View className="w-full flex-row items-center gap-[4px]">
        <Image
          source={runningIcon}
          style={{ width: 18, height: 18 }}
          contentFit="contain"
        />
        <Text className="font-flow text-[12px] text-flow-pink">
          公約ポスター
        </Text>
      </View>

      <View style={{ width: POSTER_DISPLAY_WIDTH }}>
        <PosterCanvas
          settings={settings}
          slogan={slogan}
          palette={palette}
          posterRef={posterRef}
          onPhotoLoaded={onPhotoLoaded}
        />

        {/* Figma 2703:24315。保存はポスター右上のアイコンから */}
        <Pressable
          onPress={onPressSave}
          disabled={saveDisabled}
          accessibilityRole="button"
          accessibilityLabel={
            saving ? "ポスターを保存しています" : "ポスターを保存する"
          }
          accessibilityState={{ disabled: saveDisabled, busy: saving }}
          hitSlop={8}
          className={saveDisabled ? "opacity-50" : "active:opacity-70"}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: SAVE_BUTTON_SIZE,
            height: SAVE_BUTTON_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={downloadIcon}
            style={{
              width: SAVE_ICON_SIZE,
              height: SAVE_ICON_SIZE,
              tintColor: "#24292f",
            }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      {/* Figma 2703:24321 Link-Save */}
      <Pressable
        onPress={onPressEdit}
        accessibilityRole="button"
        accessibilityLabel="ポスターを編集する"
        className="w-full flex-row items-center gap-[8px] rounded-[12px] bg-white px-[20px] py-[12px] active:opacity-80"
        style={{ borderWidth: 1, borderColor: LINK_BORDER }}
      >
        <Text className="flex-1 font-flow-medium text-[14px] text-flow-ink">
          ポスターを編集する
        </Text>
        <Image
          source={editIcon}
          style={{ width: 16.4, height: 16.4, tintColor: "#24292f" }}
          contentFit="contain"
        />
      </Pressable>
    </View>
  );
}
