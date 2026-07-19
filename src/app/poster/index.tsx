import { useRef, useState } from "react";
import { View as RNView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { PosterCanvas } from "@/features/poster/poster-canvas";
import {
  NAME_MAX_LENGTH,
  POSTER_PALETTES,
} from "@/features/poster/templates";
import { usePosterExport } from "@/features/poster/use-poster-export";
import { usePosterPhoto } from "@/features/poster/use-poster-photo";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";

export default function PosterScreen() {
  const router = useRouter();
  const { wishId } = useLocalSearchParams<{ wishId?: string }>();
  const wishes = useWishStore((s) => s.wishes);
  const hasHydrated = useWishStore((s) => s.hasHydrated);
  const setPosterUri = useWishStore((s) => s.setPosterUri);
  const posterRef = useRef<RNView>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoReady, setPhotoReady] = useState(false);
  const [name, setName] = useState("");
  const [selectedWishId, setSelectedWishId] = useState<string | null>(
    wishId ?? null
  );
  const [paletteId, setPaletteId] = useState(POSTER_PALETTES[0].id);
  const palette =
    POSTER_PALETTES.find((p) => p.id === paletteId) ?? POSTER_PALETTES[0];

  // 公約は開票結果から保存したwishのみ(自由入力なし)。未指定なら最新を選ぶ
  const activeWishes = wishes.filter((w) => w.status === "active");
  const selectedWish =
    activeWishes.find((w) => w.id === selectedWishId) ?? activeWishes[0] ?? null;

  const { pickFromLibrary, takePhoto } = usePosterPhoto((uri) => {
    setPhotoReady(false);
    setPhotoUri(uri);
  });
  const { busy, share, saveToLibrary } = usePosterExport(posterRef);

  // 写真のデコード完了(photoReady)までキャプチャすると空写真になり得る
  const exportable =
    photoUri !== null && photoReady && !busy && selectedWish !== null;

  const handleSaveToLibrary = async () => {
    const uri = await saveToLibrary();
    if (!uri || !selectedWish) return;
    const updatedWish = setPosterUri(selectedWish.id, uri);
    if (updatedWish) mirrorWish(updatedWish);
  };

  return (
    <View className="flex-1 bg-election-cream">
      <ScrollView contentContainerClassName="px-6 pb-16 pt-16">
        <Text className="text-sm font-bold tracking-widest text-election-red">
          選挙ポスター製作所
        </Text>
        <Text className="mt-2 text-2xl font-bold text-election-ink">
          あなたを公認候補にします
        </Text>

        <View className="mt-6">
          <PosterCanvas
            photoUri={photoUri}
            name={name}
            slogan={selectedWish?.text ?? ""}
            palette={palette}
            posterRef={posterRef}
            onPhotoLoaded={() => setPhotoReady(true)}
            onPressPhoto={pickFromLibrary}
          />
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={pickFromLibrary}
            className="flex-1 items-center rounded-full border-2 border-election-red py-3"
          >
            <Text className="font-bold text-election-red">🖼️ 写真を選ぶ</Text>
          </Pressable>
          <Pressable
            onPress={takePhoto}
            className="flex-1 items-center rounded-full border-2 border-election-red py-3"
          >
            <Text className="font-bold text-election-red">📸 撮影する</Text>
          </Pressable>
        </View>

        <Text className="mt-6 text-xs font-bold text-election-ink/50">
          掲げる公約
        </Text>
        {!hasHydrated ? null : activeWishes.length === 0 ? (
          <View className="mt-2 items-center rounded-2xl border-2 border-dashed border-election-ink/20 bg-election-paper px-4 py-6">
            <Text className="text-center text-sm text-election-ink/70">
              まだ公約がありません。{"\n"}
              まず総選挙で「これをやるぞ」を選ぼう
            </Text>
            <Pressable
              onPress={() => router.push("/election")}
              className="mt-4 rounded-full bg-election-red px-6 py-3"
            >
              <Text className="font-bold text-white">
                🗳️ 総選挙をはじめる
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-2 gap-2">
            {activeWishes.map((w) => {
              const selected = w.id === selectedWish?.id;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => setSelectedWishId(w.id)}
                  className={`flex-row items-center gap-3 rounded-xl border-2 bg-election-paper px-4 py-3 ${
                    selected ? "border-election-gold" : "border-election-ink/10"
                  }`}
                >
                  <Text className="text-base">{selected ? "🪧" : "📋"}</Text>
                  <Text
                    className={`flex-1 text-sm ${
                      selected
                        ? "font-bold text-election-ink"
                        : "text-election-ink/70"
                    }`}
                  >
                    {w.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text className="mt-4 text-xs font-bold text-election-ink/50">
          名前(縦書きになります)
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={NAME_MAX_LENGTH}
          placeholder={`例: 山田太郎(${NAME_MAX_LENGTH}文字まで)`}
          className="mt-2 rounded-xl border-2 border-election-ink/10 bg-election-paper px-4 py-3 text-base text-election-ink"
        />

        <Text className="mt-4 text-xs font-bold text-election-ink/50">
          カラー
        </Text>
        <View className="mt-2 flex-row gap-3">
          {POSTER_PALETTES.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setPaletteId(p.id)}
              className={`flex-row items-center gap-2 rounded-full border-2 px-4 py-2 ${
                p.id === paletteId
                  ? "border-election-gold bg-election-paper"
                  : "border-election-ink/10"
              }`}
            >
              <View className={`h-4 w-4 rounded-full ${p.band}`} />
              <Text className="text-sm font-bold text-election-ink">
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleSaveToLibrary}
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
          onPress={() => router.dismissTo("/")}
          className="mt-3 items-center rounded-full border-2 border-election-ink/20 py-4"
        >
          <Text className="text-base font-bold text-election-ink">
            ホームへ戻る
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
