import { Text, View } from "@/tw";

// RNのwritingDirectionは横書きのLTR/RTL用で縦書きには使えないため、
// 1文字ずつ縦に積む方式で縦書きを再現する。
// 長音・波線・括弧類は縦書きでは90度回転させる必要がある。
const ROTATE_CHARS = new Set([
  "ー",
  "ｰ",
  "−",
  "-",
  "－",
  "〜",
  "~",
  "…",
  "(",
  ")",
  "（",
  "）",
  "「",
  "」",
]);

type Props = {
  text: string;
  fontSize: number;
  lineHeight: number;
  color: string;
};

export function VerticalText({ text, fontSize, lineHeight, color }: Props) {
  return (
    <View className="items-center">
      {/* スプレッド構文ならサロゲートペア(絵文字等)も安全に分割できる */}
      {[...text].map((char, index) => (
        // 1文字ぶんの高さをViewで固定する。Textだけだと実高さがプラットフォーム差
        // (Androidのフォントパディング等)で lineHeight を上回り、列が計算より伸びて
        // 氏名帯に潜り込むため。vertical-slogan.tsx の段組み計算はこの
        // 「1文字 = ちょうど lineHeight」を前提にしている
        <View
          key={`${index}-${char}`}
          style={{ height: lineHeight, justifyContent: "center" }}
        >
          <Text
            className="font-flow"
            style={{
              fontSize,
              lineHeight,
              color,
              includeFontPadding: false,
              ...(ROTATE_CHARS.has(char)
                ? { transform: [{ rotate: "90deg" }] }
                : null),
            }}
          >
            {char}
          </Text>
        </View>
      ))}
    </View>
  );
}
