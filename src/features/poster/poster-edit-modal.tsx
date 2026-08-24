import { useEffect, useState } from "react";
import { Alert, Modal } from "react-native";
import { pickRandomPresetAvatarId } from "@/features/avatar/preset-avatars";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
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

/**
 * ポスターの編集（Figma 2040:6371 → 2040:6437）。
 * 中央にフロートする白カードに、テキストリンクを4行並べただけのアクションシート。
 * 閉じるボタンは無く、暗幕タップで閉じる。
 *
 * シートと名前入力は「兄弟」として並べ、Modal の入れ子を作らない
 * （入れ子は Android で表示が崩れる）。写真ピッカーも iOS で presentation が
 * 競合するため、シートを閉じてから起動する。
 */
export function PosterEditModal({
  visible,
  wish,
  settings,
  nicknamePlaceholder,
  onClose,
  onImageChanged,
}: Props) {
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

  /** シートを畳んでからネイティブのピッカーを開く */
  const runWithSheetClosed = (start: () => void) => {
    if (photoSaving) return;
    onClose();
    start();
  };

  const options: { label: string; onPress: () => void }[] = [
    { label: "ニックネームを変更する", onPress: () => setMode("name") },
    { label: "アバターを生成する", onPress: handleShufflePresetAvatar },
    {
      label: "写真をアップロードする",
      onPress: () => runWithSheetClosed(pickFromLibrary),
    },
    {
      label: "写真を撮る",
      onPress: () => runWithSheetClosed(takePhoto),
    },
  ];

  return (
    <>
      <Modal
        visible={visible && mode === "sheet"}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="flex-1 items-center justify-center bg-black/50 px-[20px]"
        >
          {/* カード内のタップで閉じないよう、ここでタッチを止める */}
          <View
            onStartShouldSetResponder={() => true}
            className="w-full max-w-[350px] items-center gap-[16px] rounded-[20px] bg-white px-[20px] py-[24px]"
          >
            <Text className="w-full text-center font-flow text-[18px] leading-[26px] text-flow-ink">
              ポスターをAI編集する
            </Text>

            <View className="w-full gap-[10px]">
              {options.map((option) => (
                <Pressable
                  key={option.label}
                  onPress={option.onPress}
                  accessibilityRole="button"
                  className="h-[30px] w-full items-center justify-center px-[16px] active:opacity-60"
                >
                  <Text className="font-flow-regular text-[14px] text-flow-ink">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
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
