import { useEffect, useState } from "react";
import { ActivityIndicator, Modal } from "react-native";
import { useAiAvatar, type AiAvatarResult } from "@/features/avatar/use-ai-avatar";
import { deleteManagedPosterPhoto } from "@/features/poster/photo-storage";
import {
  AVATAR_REQUEST_MAX_LENGTH,
  AVATAR_STYLES,
  type AvatarStyleId,
} from "@/services/ai/prompts/avatar";
import { AI_AVATAR_DAILY_LIMIT, useAiUsageStore } from "@/stores/ai-usage";
import { Image } from "@/tw/image";
import { Pressable, Text, TextInput, View } from "@/tw";

type AiAvatarModalProps = {
  visible: boolean;
  wishId: string;
  /** 公約テキスト。テキストのみ生成の味付けに使う */
  slogan: string;
  paletteLabel: string;
  /** 設定済みの写真。あれば似顔絵化、なければテキストのみ生成になる */
  sourceUri?: string;
  onConfirm: (result: AiAvatarResult) => void;
  onClose: () => void;
};

export function AiAvatarModal({
  visible,
  wishId,
  slogan,
  paletteLabel,
  sourceUri,
  onConfirm,
  onClose,
}: AiAvatarModalProps) {
  const [styleId, setStyleId] = useState<AvatarStyleId>("caricature");
  const [extraRequest, setExtraRequest] = useState("");
  const [preview, setPreview] = useState<AiAvatarResult | null>(null);
  const { busy, generate, cancel } = useAiAvatar();
  const remaining = useAiUsageStore((state) => state.remainingToday());

  useEffect(() => {
    if (visible) setPreview(null);
  }, [visible]);

  /** 採用しなかった生成画像はファイルごと捨てる */
  const discardPreview = () => {
    if (preview) deleteManagedPosterPhoto(preview.uri);
    setPreview(null);
  };

  const handleGenerate = async () => {
    discardPreview();
    const result = await generate({
      wishId,
      styleId,
      paletteLabel,
      sourceUri,
      slogan,
      extraRequest,
    });
    if (result) setPreview(result);
  };

  const handleClose = () => {
    cancel();
    discardPreview();
    onClose();
  };

  const handleConfirm = () => {
    if (!preview) return;
    const result = preview;
    // onConfirm側で採用するのでここでは消さない
    setPreview(null);
    onConfirm(result);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-lg rounded-2xl bg-election-paper p-5">
          <Text className="text-base font-bold text-election-ink">
            ✨ AIアバターをつくる
          </Text>
          <Text className="mt-1 text-xs leading-5 text-election-ink/60">
            {sourceUri
              ? "設定中の写真から、選挙ポスター用の似顔絵を生成します。"
              : "写真を使わずに、架空の候補者キャラクターを生成します。"}
          </Text>

          <Text className="mt-4 text-xs font-bold text-election-ink/50">
            画風
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {AVATAR_STYLES.map((style) => (
              <Pressable
                key={style.id}
                onPress={() => setStyleId(style.id)}
                disabled={busy}
                className={`rounded-full border-2 px-4 py-2 ${
                  style.id === styleId
                    ? "border-election-gold bg-white"
                    : "border-election-ink/10"
                }`}
              >
                <Text className="text-sm font-bold text-election-ink">
                  {style.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mt-4 text-xs font-bold text-election-ink/50">
            追加のリクエスト（任意）
          </Text>
          <TextInput
            value={extraRequest}
            onChangeText={setExtraRequest}
            editable={!busy}
            maxLength={AVATAR_REQUEST_MAX_LENGTH}
            placeholder="例: 眼鏡をかけて、背景は青"
            placeholderTextColor="#2b2b2b66"
            className="mt-2 rounded-xl border-2 border-election-ink/10 bg-white px-4 py-2.5 text-sm text-election-ink"
          />

          <View
            className="mt-4 w-full self-center overflow-hidden rounded-xl bg-election-ink/5"
            style={{ aspectRatio: 3 / 4, maxWidth: 240 }}
          >
            {busy ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#c0392b" />
                <Text className="mt-3 text-xs font-bold text-election-ink/60">
                  生成中…（20秒ほどかかります）
                </Text>
              </View>
            ) : preview ? (
              <Image
                source={preview.uri}
                className="h-full w-full"
                contentFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-center text-xs leading-5 text-election-ink/40">
                  ここに生成結果が表示されます
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-3 text-center text-xs text-election-ink/50">
            本日の残り {remaining} / {AI_AVATAR_DAILY_LIMIT} 回
          </Text>

          {preview ? (
            <Pressable
              onPress={handleConfirm}
              className="mt-4 items-center rounded-full bg-election-red py-3.5"
            >
              <Text className="text-base font-bold text-white">これにする</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleGenerate}
            disabled={busy || remaining <= 0}
            className={`mt-3 items-center rounded-full py-3.5 ${
              preview ? "border-2 border-election-red" : "bg-election-red"
            } ${busy || remaining <= 0 ? "opacity-40" : ""}`}
          >
            <Text
              className={`text-base font-bold ${
                preview ? "text-election-red" : "text-white"
              }`}
            >
              {busy
                ? "生成中…"
                : preview
                  ? "🔄 もう一度生成する"
                  : "✨ 生成する"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClose}
            className="mt-3 items-center rounded-full border-2 border-election-ink/20 py-3.5"
          >
            <Text className="text-base font-bold text-election-ink">
              閉じる
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
