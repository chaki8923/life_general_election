import { Pressable, Text } from "@/tw";

type DevGuideButtonProps = {
  onPress: () => void;
  /** 配置は呼び出し側に任せる（画面ごとに置き場所が違うため） */
  className?: string;
};

/**
 * 開発用: 初回のみ自動表示されるガイドを、いつでも開き直すためのボタン。
 * 本番ビルドでは何も描かない。
 */
export function DevGuideButton({
  onPress,
  className = "",
}: DevGuideButtonProps) {
  if (!__DEV__) return null;

  return (
    <Pressable onPress={onPress} hitSlop={12} className={className}>
      <Text className="font-flow-medium text-[11px] text-flow-ink-low">
        📖 [DEV] ガイドを見る
      </Text>
    </Pressable>
  );
}
