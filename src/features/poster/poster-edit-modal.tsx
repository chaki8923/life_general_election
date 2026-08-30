import { useEffect, useRef, useState } from "react";
import { Alert, Modal, Platform } from "react-native";
import { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pickRandomPresetAvatarId } from "@/features/avatar/preset-avatars";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
import { Animated } from "@/tw/animated";
import { Pressable, Text, View } from "@/tw";
import type { PosterSettings, Wish } from "@/types";
import {
  deleteManagedPosterPhoto,
  persistPosterPhoto,
  type PickedPosterImage,
} from "./photo-storage";
import { PosterNameModal } from "./poster-name-modal";
import { getPosterImageUri } from "./poster-settings";
import { usePosterPhoto } from "./use-poster-photo";

type Props = {
  visible: boolean;
  wish: Wish;
  settings: PosterSettings;
  nicknamePlaceholder: string;
  onClose: () => void;
  /** 画像が差し替わったら呼ぶ。呼び出し側はキャプチャ待ちフラグを戻す */
  onImageChanged: () => void;
};

/** 同時に開くのは常に1つ。RNのModalは入れ子にすると Android で崩れるため */
type Mode = "sheet" | "name";

/** シート左右の余白。進捗報告ガイド（mypage-guide-modal）と揃える */
const SHEET_PADDING = 24;

/**
 * ポスターの編集（Figma 2040:6371 → 2040:6437）。
 * 画面下から出る白いシートに、テキストリンクを4行並べただけのアクションシート。
 * 閉じるボタンは無く、暗幕タップで閉じる。
 *
 * シートと名前入力は「兄弟」として並べ、Modal の入れ子を作らない
 * （入れ子は Android で表示が崩れる）。写真ピッカーも iOS で presentation が
 * 競合するため、シートが閉じ切ってから起動する（runWithSheetClosed）。
 */
export function PosterEditModal({
  visible,
  wish,
  settings,
  nicknamePlaceholder,
  onClose,
  onImageChanged,
}: Props) {
  const insets = useSafeAreaInsets();
  const setPosterSettings = useWishStore((state) => state.setPosterSettings);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("sheet");

  // 開き直したときは必ずシートから
  useEffect(() => {
    if (visible) setMode("sheet");
  }, [visible]);

  const saveSettings = (next: PosterSettings) => {
    const updated = setPosterSettings(wish.id, next);
    if (updated) mirrorWish(updated);
  };

  const handlePicked = async (asset: PickedPosterImage) => {
    if (photoSaving) return;
    setPhotoSaving(true);
    try {
      const uri = await persistPosterPhoto(wish.id, asset);
      const previousUri = getPosterImageUri(settings.image);
      onImageChanged();
      saveSettings({ ...settings, image: { kind: "photo", uri } });
      if (previousUri !== uri) deleteManagedPosterPhoto(previousUri);
    } catch (error) {
      if (__DEV__) console.warn("[poster/persist-photo]", error);
      Alert.alert(
        "写真を保存できませんでした",
        "別の写真を選ぶか、もう一度お試しください。"
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  const { pickFromLibrary, takePhoto } = usePosterPhoto(handlePicked);

  /** 既製アバターから1枚引いて即反映する。今と同じ絵は引かない */
  const handleShufflePresetAvatar = () => {
    const previousUri = getPosterImageUri(settings.image);
    const currentId =
      settings.image.kind === "preset" ? settings.image.id : undefined;
    onImageChanged();
    saveSettings({
      ...settings,
      image: { kind: "preset", id: pickRandomPresetAvatarId(currentId) },
    });
    // 差し替え前が端末に持っていた写真なら片付ける
    deleteManagedPosterPhoto(previousUri);
    onClose();
  };

  // onClose はただの setState で、その時点ではまだ Modal は閉じ切っていない。
  // 同じ tick でネイティブのピッカーを開くと、iOS は dismiss 中の
  // RCTModalHostViewController から present するため黙って無視され、
  // Android は isPickerOpen ガードで canceled が返る（＝どちらも無反応に見える）。
  // 起動処理をここに預けて、閉じ切ってから流す。
  const pendingAction = useRef<(() => void) | null>(null);

  const flushPendingAction = () => {
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  };

  /** シートを畳んでからネイティブのピッカーを開く */
  const runWithSheetClosed = (start: () => void) => {
    if (photoSaving) return;
    pendingAction.current = start;
    onClose();
    // onDismiss は iOS 専用。Android/Web はモーダルが外れた次フレームで流す
    if (Platform.OS !== "ios") requestAnimationFrame(flushPendingAction);
  };

  const options: { label: string; onPress: () => void }[] = [
    { label: "アバターを生成する", onPress: handleShufflePresetAvatar },
    {
      label: "写真をアップロードする",
      onPress: () => runWithSheetClosed(pickFromLibrary),
    },
    {
      label: "写真を撮る",
      onPress: () => runWithSheetClosed(takePhoto),
    },
    { label: "ニックネームを変更する", onPress: () => setMode("name") },
  ];

  return (
    <>
      <Modal
        visible={visible && mode === "sheet"}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        onDismiss={flushPendingAction}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          {/* シート内のタップで閉じないよう、ここでタッチを止める */}
          <Animated.View
            entering={SlideInDown.duration(280)}
            onStartShouldSetResponder={() => true}
            className="items-center gap-[16px] rounded-t-[24px] bg-white"
            style={{
              paddingTop: SHEET_PADDING,
              paddingHorizontal: SHEET_PADDING,
              paddingBottom: SHEET_PADDING + insets.bottom,
            }}
          >
            <Text className="w-full text-center font-flow text-[18px] leading-[26px] text-flow-ink">
              ポスターを編集する
            </Text>

            {/* 4行を1枚のグループ枠に収め、行間はヘアラインで区切る */}
            <View
              className="w-full rounded-[16px] bg-white"
              style={{ boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" }}
            >
              {options.map((option, index) => (
                <Pressable
                  key={option.label}
                  onPress={option.onPress}
                  accessibilityRole="button"
                  className={`h-[48px] w-full items-center justify-center px-[16px] active:opacity-60 ${
                    index < options.length - 1
                      ? "border-b border-[#eaeef2]"
                      : ""
                  }`}
                >
                  <Text className="font-flow-regular text-[14px] text-flow-ink">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      <PosterNameModal
        visible={visible && mode === "name"}
        value={settings.candidateName}
        placeholder={nicknamePlaceholder}
        onSave={(candidateName) => {
          saveSettings({ ...settings, candidateName });
          onClose();
        }}
        onClose={() => setMode("sheet")}
      />
    </>
  );
}
