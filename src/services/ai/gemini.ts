const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const isGeminiConfigured = Boolean(API_KEY);

/**
 * GeminiにJSONモードでプロンプトを投げ、パース済みオブジェクトを返す。
 * キー未設定・通信失敗・パース失敗時はnull（呼び出し側でモックにフォールバック）。
 */
export async function generateJson<T>(prompt: string): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0,
        },
      }),
    });
    if (!res.ok) {
      if (__DEV__) console.warn("[gemini]", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    if (__DEV__) console.warn("[gemini]", e);
    return null;
  }
}
