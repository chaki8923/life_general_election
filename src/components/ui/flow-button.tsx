import { ActivityIndicator } from "react-native";
import { Pressable, Text, View } from "@/tw";

type FlowButtonProps = {
  label: string;
  /** primary = 濃紺塗り / gray = Figmaのprimary-button（#737373） / pink = アクセント塗り / dashed = 白抜き破線（「選び直す」など） */
  variant?: "primary" | "gray" | "pink" | "dashed";
  disabled?: boolean;
  /** 処理中はラベルをスピナーへ置き換え、連打を防ぐ */
  loading?: boolean;
  onPress: () => void;
  /** 幅指定などの上書き用 */
  className?: string;
  /** variant の塗りを上書き（開票カード 2位橙 / 3位紫など） */
  fillColor?: string;
};

/** 選挙フロー共通ボタン（Figma: h48 / rounded-full / 16px Bold / tracking 0.8） */
export function FlowButton({
  label,
  variant = "primary",
  disabled = false,
  loading = false,
  onPress,
  className = "",
  fillColor,
}: FlowButtonProps) {
  const interactionDisabled = disabled || loading;
  const isDashed = variant === "dashed" && !fillColor;
  const fill = fillColor
    ? "active:opacity-80"
    : disabled && !loading
      ? "bg-flow-disabled"
      : variant === "pink"
        ? "bg-flow-pink active:opacity-80"
        : variant === "gray"
          ? "bg-flow-gray active:opacity-80"
          : "bg-flow-dark active:opacity-80";
  const container =
    isDashed && !disabled
      ? "border-2 border-dashed border-black bg-white"
      : fill;
  const ink = isDashed && !disabled ? "text-[#060505]" : "text-white";
  const customFill = fillColor ? { backgroundColor: fillColor } : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={interactionDisabled}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${label}、読み込み中` : label}
      accessibilityState={{ disabled: interactionDisabled, busy: loading }}
      style={customFill}
      className={`h-12 items-center justify-center rounded-full px-6 ${container} ${className}`}
    >
      <View>
        {loading ? (
          <ActivityIndicator color={isDashed ? "#060505" : "#ffffff"} />
        ) : (
          <Text className={`font-flow text-base tracking-[0.8px] ${ink}`}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
