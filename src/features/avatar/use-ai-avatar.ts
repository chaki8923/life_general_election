import { useRef, useState } from "react";
import { Alert } from "react-native";
import {
  deleteManagedPosterPhoto,
  persistGeneratedPosterImage,
  readPosterImageAsBase64,
} from "@/features/poster/photo-storage";
import { generateAvatarImage } from "@/services/ai/gemini-image";
import {
  buildAvatarCreatePrompt,
  buildAvatarEditPrompt,
  getAvatarStyle,
  type AvatarStyleId,
} from "@/services/ai/prompts/avatar";
import { useAiUsageStore } from "@/stores/ai-usage";
import { useProfileStore } from "@/stores/profile";

export type AiAvatarRequest = {
  wishId: string;
  styleId: AvatarStyleId;
  paletteLabel: string;
  /** 似顔絵化の元にする写真。省略するとテキストのみでキャラを生成する */
  sourceUri?: string;
  /** 公約テキスト。テキストのみ生成のときだけ使う */
  slogan?: string;
  /** ユーザーが自由入力した見た目の希望 */
  extraRequest?: string;
};

export type AiAvatarResult = { uri: string; sourceUri?: string };

/** 顔写真の送信同意をAlertで取る。既に同意済みなら即true */
function confirmPhotoConsent(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "写真をAIに送信します",
      "似顔絵をつくるため、選んだ写真をGoogleのAIへ送信します。生成した画像はこの端末にだけ保存されます。",
      [
        { text: "キャンセル", style: "cancel", onPress: () => resolve(false) },
        { text: "同意して続ける", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

/** AIアバターの生成〜端末保存までを担うフック */
export function useAiAvatar() {
  const [busy, setBusy] = useState(false);
  const profile = useProfileStore((state) => state.profile);
  // 連打時に古いレスポンスで上書きしないための世代カウンタ
  const requestId = useRef(0);

  const generate = async ({
    wishId,
    styleId,
    paletteLabel,
    sourceUri,
    slogan,
    extraRequest,
  }: AiAvatarRequest): Promise<AiAvatarResult | null> => {
    if (busy) return null;

    const usage = useAiUsageStore.getState();
    if (usage.remainingToday() <= 0) {
      Alert.alert(
        "本日の生成回数の上限です",
        "AIアバターの生成は1日3回までです。明日また試してみてください。"
      );
      return null;
    }

    const style = getAvatarStyle(styleId);
    const current = ++requestId.current;
    setBusy(true);
    try {
      let sourceImage = undefined;
      if (sourceUri) {
        if (!usage.avatarConsent) {
          if (!(await confirmPhotoConsent())) return null;
          useAiUsageStore.getState().grantConsent();
        }
        const read = await readPosterImageAsBase64(sourceUri);
        if (!read) {
          Alert.alert(
            "写真を読み込めませんでした",
            "写真を選び直してからもう一度お試しください。"
          );
          return null;
        }
        sourceImage = read;
      }

      const prompt = sourceImage
        ? buildAvatarEditPrompt({
            styleDirection: style.direction,
            paletteLabel,
            extraRequest,
          })
        : buildAvatarCreatePrompt({
            styleDirection: style.direction,
            paletteLabel,
            extraRequest,
            context: {
              ageRange: profile?.ageRange ?? "30代",
              gender: profile?.gender,
              slogan,
            },
          });

      const result = await generateAvatarImage({ prompt, sourceImage });
      // 生成中に閉じられた/次の生成が始まっていたら結果は捨てる
      if (current !== requestId.current) return null;

      if (!result.ok) {
        // blockedはリクエストが拒否されただけで生成は走っていないため回数を消費しない。
        // emptyはモデルが応答を返している＝課金が発生しているので消費する
        if (result.reason === "empty") useAiUsageStore.getState().consume();
        Alert.alert(...failureMessage(result.reason));
        return null;
      }

      // 画像が返ってきた時点で課金は確定しているので、保存前に消費しておく
      useAiUsageStore.getState().consume();
      const uri = await persistGeneratedPosterImage(wishId, result.image);
      if (current !== requestId.current) {
        // 保存中に破棄されたので、書き出したファイルも残さない
        deleteManagedPosterPhoto(uri);
        return null;
      }
      return { uri, sourceUri };
    } catch (e) {
      if (__DEV__) console.warn("[avatar/generate]", e);
      Alert.alert("AIアバターの生成に失敗しました…");
      return null;
    } finally {
      if (current === requestId.current) setBusy(false);
    }
  };

  /** 表示中の生成を無効化する（モーダルを閉じたときなど） */
  const cancel = () => {
    requestId.current += 1;
    setBusy(false);
  };

  return { busy, generate, cancel };
}

function failureMessage(
  reason: "unconfigured" | "blocked" | "network" | "empty"
): [string, string] {
  switch (reason) {
    case "unconfigured":
      return [
        "AI生成を利用できません",
        "Gemini APIキーが設定されていません。管理者にお問い合わせください。",
      ];
    case "blocked":
      return [
        "この画像では生成できませんでした",
        "AIの安全性チェックにより断られました。別の写真か、別のスタイルでお試しください。",
      ];
    case "empty":
      return [
        "うまく生成できませんでした",
        "スタイルを変えて、もう一度お試しください。",
      ];
    case "network":
      return [
        "生成に失敗しました",
        "通信環境を確認して、もう一度お試しください。",
      ];
  }
}
