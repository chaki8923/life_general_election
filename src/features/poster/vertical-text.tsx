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
  className?: string;
};

export function VerticalText({ text, fontSize, className }: Props) {
  return (
    <View className="items-center">
      {/* スプレッド構文ならサロゲートペア(絵文字等)も安全に分割できる */}
      {[...text].map((char, index) => (
        <Text
          key={`${index}-${char}`}
          className={className}
          style={{
            fontSize,
            lineHeight: fontSize * 1.12,
            ...(ROTATE_CHARS.has(char)
              ? { transform: [{ rotate: "90deg" }] }
              : null),
          }}
        >
          {char}
        </Text>
      ))}
    </View>
  );
}
