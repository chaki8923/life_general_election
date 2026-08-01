import { useRef, useState } from "react";
import { Alert, View as RNView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PosterCanvas } from "@/features/poster/poster-canvas";
import {
  deleteManagedPosterPhoto,
  persistPosterPhoto,
  type PickedPosterImage,
} from "@/features/poster/photo-storage";
import {
  createDefaultPosterSettings,
  resolvePosterSettings,
} from "@/features/poster/poster-settings";
import { getPosterLevel, POSTER_LEVEL_META } from "@/features/poster/level";
import {
  getPosterPalette,
  NAME_MAX_LENGTH,
  POSTER_PALETTES,
} from "@/features/poster/templates";
import { usePosterExport } from "@/features/poster/use-poster-export";
import { usePosterPhoto } from "@/features/poster/use-poster-photo";
import { mirrorWish } from "@/services/firebase/mirror";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import type { PosterSettings } from "@/types";

export default function PosterScreen() {
  const router = useRouter();
  const { wishId } = useLocalSearchParams<{ wishId?: string }>();
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);
  const setPosterSettings = useWishStore((state) => state.setPosterSettings);
  const nickname = useProfileStore((state) => state.profile?.nickname ?? "");
  const posterRef = useRef<RNView>(null);
  const [photoReady, setPhotoReady] = useState(true);
  const [photoSaving, setPhotoSaving] = useState(false);

  const wish = wishes.find((item) => item.id === wishId) ?? null;
  const doneCount = wishes.filter((item) => item.status === "done").length;
  const level = getPosterLevel(doneCount);
  const storedSettings =
    wish?.posterSettings ?? createDefaultPosterSettings();
  const displaySettings = wish
    ? resolvePosterSettings(wish, nickname)
    : createDefaultPosterSettings();
  const palette = getPosterPalette(displaySettings.paletteId);
  const { busy, share, saveToLibrary } = usePosterExport(posterRef);

  const saveSettings = (next: PosterSettings, shouldMirror = true) => {
    if (!wish) return;
    const updated = setPosterSettings(wish.id, next);
    if (updated && shouldMirror) mirrorWish(updated);
  };

  const handlePicked = async (asset: PickedPosterImage) => {
    if (!wish || photoSaving) return;
    setPhotoSaving(true);
    try {
      const uri = await persistPosterPhoto(wish.id, asset);
      const previousUri =
        storedSettings.image.kind === "photo"
          ? storedSettings.image.uri
          : undefined;
      setPhotoReady(false);
      saveSettings({
        ...storedSettings,
        image: { kind: "photo", uri },
      });
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

  const resetToCharacter = () => {
    const previousUri =
      storedSettings.image.kind === "photo"
        ? storedSettings.image.uri
        : undefined;
    setPhotoReady(true);
    saveSettings({
      ...storedSettings,
      image: { kind: "character" },
    });
    deleteManagedPosterPhoto(previousUri);
  };

  const updateName = (candidateName: string) => {
    saveSettings({ ...storedSettings, candidateName }, false);
  };

  const updatePalette = (paletteId: PosterSettings["paletteId"]) => {
    saveSettings({ ...storedSettings, paletteId });
  };

  const exportable =
    wish !== null &&
    !busy &&
    !photoSaving &&
    (displaySettings.image.kind === "character" || photoReady);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-election-cream">
        <Text className="text-sm font-bold text-election-ink/60">
          ポスターを読み込んでいます…
        </Text>
      </View>
    );
  }

  if (!wish) {
    return (
      <View className="flex-1 items-center justify-center bg-election-cream px-6">
        <Text className="text-lg font-bold text-election-ink">
          公約が見つかりません
        </Text>
        <Pressable
          onPress={() => router.dismissTo("/mypage")}
          className="mt-6 rounded-full bg-election-red px-7 py-3"
        >
          <Text className="font-bold text-white">マイページへ戻る</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-election-cream">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-6 pb-16 pt-16"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-bold tracking-widest text-election-red">
              選挙ポスター製作所
            </Text>
            <Text className="mt-2 text-2xl font-bold text-election-ink">
              公約ごとの一枚をつくる
            </Text>
          </View>
          <View className="rounded-full bg-election-navy px-3 py-1.5">
            <Text className="text-xs font-black text-election-gold">
              LV.{level}
            </Text>
          </View>
        </View>

        <View className="mt-3 rounded-xl bg-white/70 px-4 py-3">
          <Text className="text-xs font-bold text-election-red">
            {POSTER_LEVEL_META[level].title}
          </Text>
          <Text className="mt-1 text-xs leading-5 text-election-ink/60">
            {POSTER_LEVEL_META[level].description}
          </Text>
        </View>

        <View className="mt-6">
          <PosterCanvas
            settings={displaySettings}
            slogan={wish.text}
            palette={palette}
            level={level}
            posterRef={posterRef}
            onPhotoLoaded={() => setPhotoReady(true)}
            onPressPhoto={pickFromLibrary}
            interactive={!busy}
          />
        </View>

        <Text className="mt-5 text-xs font-bold text-election-ink/50">
          候補者画像（公約ごとに保存されます）
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          <Pressable
            onPress={resetToCharacter}
            className={`rounded-full border-2 px-4 py-2.5 ${
              displaySettings.image.kind === "character"
                ? "border-election-pink bg-white"
                : "border-election-ink/10"
            }`}
          >
            <Text className="font-bold text-election-ink">
              🎩 既定キャラ
            </Text>
          </Pressable>
          <Pressable
            onPress={pickFromLibrary}
            disabled={photoSaving}
            className="rounded-full border-2 border-election-red px-4 py-2.5"
          >
            <Text className="font-bold text-election-red">
              {photoSaving ? "保存中…" : "🖼️ 写真を選ぶ"}
            </Text>
          </Pressable>
          <Pressable
            onPress={takePhoto}
            disabled={photoSaving}
            className="rounded-full border-2 border-election-red px-4 py-2.5"
          >
            <Text className="font-bold text-election-red">📸 撮影する</Text>
          </Pressable>
        </View>

        <Text className="mt-5 text-xs font-bold text-election-ink/50">
          名前（自動保存）
        </Text>
        <TextInput
          value={storedSettings.candidateName}
          onChangeText={updateName}
          onBlur={() => {
            const latest = useWishStore
              .getState()
              .wishes.find((item) => item.id === wish.id);
            if (latest) mirrorWish(latest);
          }}
          maxLength={NAME_MAX_LENGTH}
          placeholder={
            nickname.trim() ||
            `例: 山田太郎（${NAME_MAX_LENGTH}文字まで）`
          }
          className="mt-2 rounded-xl border-2 border-election-ink/10 bg-election-paper px-4 py-3 text-base text-election-ink"
        />

        <Text className="mt-5 text-xs font-bold text-election-ink/50">
          イメージカラー（自動保存）
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-3">
          {POSTER_PALETTES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => updatePalette(item.id)}
              className={`flex-row items-center gap-2 rounded-full border-2 px-4 py-2 ${
                item.id === displaySettings.paletteId
                  ? "border-election-gold bg-election-paper"
                  : "border-election-ink/10"
              }`}
            >
              <View
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: item.primary }}
              />
              <Text className="text-sm font-bold text-election-ink">
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={saveToLibrary}
          disabled={!exportable}
          className={`mt-8 items-center rounded-full py-4 ${
            exportable ? "bg-election-red" : "bg-election-ink/20"
          }`}
        >
          <Text className="text-lg font-bold text-white">
            {busy ? "処理中…" : "📥 写真に保存する"}
          </Text>
        </Pressable>
        <Pressable
          onPress={share}
          disabled={!exportable}
          className={`mt-3 items-center rounded-full border-2 py-4 ${
            exportable ? "border-election-red" : "border-election-ink/20"
          }`}
        >
          <Text
            className={`text-base font-bold ${
              exportable ? "text-election-red" : "text-election-ink/40"
            }`}
          >
            📤 シェアする
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.dismissTo("/mypage")}
          className="mt-3 items-center rounded-full border-2 border-election-ink/20 py-4"
        >
          <Text className="text-base font-bold text-election-ink">
            マイページへ戻る
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
