import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, Text, View } from "@/tw";

type FlowHeaderProps = {
  title: string;
  /** 省略時は router.back() */
  onBack?: () => void;
  /** 途中離脱させたくない画面（投票中など）では矢印を隠す */
  hideBack?: boolean;
  /** 会場背景など暗い画面に重ねるとき、地の白を消して文字を白にする */
  transparent?: boolean;
  /** 右端に置く要素（ヘルプアイコンなど）。Figma 2040:6175 */
  right?: ReactNode;
};

/** 選挙フロー共通ヘッダー（Figma: 白地h42・中央タイトル・左20pxに戻る矢印） */
export function FlowHeader({
  title,
  onBack,
  hideBack = false,
  transparent = false,
  right,
}: FlowHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inkClass = transparent ? "text-flow-onDark" : "text-flow-ink";

  return (
    <View
      className={transparent ? "" : "bg-white"}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-[42px] justify-center border-b border-[#f0f0f0]">
        <Text
          className={`text-center font-flow text-base leading-[1.4] tracking-[0.8px] ${inkClass}`}
        >
          {title}
        </Text>
        {hideBack ? null : (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="戻る"
            className="absolute inset-y-0 left-5 w-6 items-center justify-center"
          >
            {/* 「く」の字は正方形の左下2辺を45度回して作る（SVG非依存） */}
            <View
              className={`h-[11px] w-[11px] border-b-2 border-l-2 ${
                transparent ? "border-flow-onDark" : "border-flow-ink"
              }`}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </Pressable>
        )}
        {right ? (
          <View className="absolute inset-y-0 right-5 justify-center">
            {right}
          </View>
        ) : null}
      </View>
    </View>
  );
}
