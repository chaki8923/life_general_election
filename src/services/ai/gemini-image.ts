const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// 画像生成は専用モデルが必要なのでテキスト用のEXPO_PUBLIC_GEMINI_MODELとは別枠。
// ||: .envで空文字定義されている場合もデフォルトへフォールバックさせる
const MODEL =
  process.env.EXPO_PUBLIC_GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image";
// Nano Banana系の画像生成はInteractions APIが現行の標準（generateContentではない）
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
// 画像生成はテキストより待たされるためgemini.tsの30秒より長く取る
const TIMEOUT_MS = 60_000;

export const isGeminiImageConfigured = Boolean(API_KEY);

export type GeneratedImage = { base64: string; mimeType: string };

/** 失敗理由。UI側でメッセージを出し分けるため null ではなく判別可能な形で返す */
export type GenerateImageFailure =
  /** APIキー未設定 */
  | "unconfigured"
  /** 安全性ポリシーで拒否された（実在人物の顔編集など） */
  | "blocked"
  /** 通信失敗・タイムアウト・サーバーエラー */
  | "network"
  /** 200だが画像が含まれていなかった */
  | "empty";

export type GenerateImageResult =
  | { ok: true; image: GeneratedImage }
  | { ok: false; reason: GenerateImageFailure };

type InteractionContent = {
  type?: string;
  data?: string;
  mime_type?: string;
};

type InteractionResponse = {
  steps?: { type?: string; content?: InteractionContent[] }[];
};

/** レスポンスのsteps[].content[]から最初の画像を取り出す */
function extractImage(data: InteractionResponse): GeneratedImage | null {
  for (const step of data.steps ?? []) {
    for (const content of step.content ?? []) {
      if (content.type === "image" && content.data) {
        return {
          base64: content.data,
          mimeType: content.mime_type || "image/jpeg",
        };
      }
    }
  }
  return null;
}

export type GenerateAvatarImageInput = {
  prompt: string;
  /** 指定すると画像編集（似顔絵化）、省略するとテキストのみの新規生成になる */
  sourceImage?: GeneratedImage;
  /** ポスター枠に合わせた比率。既定は選挙ポスターの3:4 */
  aspectRatio?: string;
};

/**
 * Geminiの画像モデルでアバター画像を生成する。
 * gemini.tsと同じくエラーは投げず、呼び出し側が理由別に扱えるunionを返す。
 */
export async function generateAvatarImage({
  prompt,
  sourceImage,
  aspectRatio = "3:4",
}: GenerateAvatarImageInput): Promise<GenerateImageResult> {
  if (!API_KEY) return { ok: false, reason: "unconfigured" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const input: unknown[] = [{ type: "text", text: prompt }];
    if (sourceImage) {
      input.push({
        type: "image",
        mime_type: sourceImage.mimeType,
        data: sourceImage.base64,
      });
    }

    if (__DEV__) {
      console.log(
        `[gemini-image] model=${MODEL} mode=${sourceImage ? "edit" : "create"}\n${prompt}`
      );
    }

    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        response_format: {
          type: "image",
          mime_type: "image/jpeg",
          aspect_ratio: aspectRatio,
          // Liteは1Kのみ対応（2K/4Kは非対応）
          image_size: "1K",
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (__DEV__) console.warn("[gemini-image]", res.status, body);
      // 安全性フィルタは400系で返る。5xx/429は再試行で直る可能性がある通信扱い
      const blocked = res.status >= 400 && res.status < 500 && res.status !== 429;
      return { ok: false, reason: blocked ? "blocked" : "network" };
    }

    const data = (await res.json()) as InteractionResponse;
    const image = extractImage(data);
    // 200でも画像が無い＝プロンプトを拒否してテキストだけ返してきたケース
    if (!image) {
      if (__DEV__) console.warn("[gemini-image] no image in response");
      return { ok: false, reason: "empty" };
    }
    return { ok: true, image };
  } catch (e) {
    if (__DEV__) console.warn("[gemini-image]", e);
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
