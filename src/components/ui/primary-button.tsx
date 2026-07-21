import { Pressable, Text, View } from "@/tw";

type PrimaryButtonProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

/** 画面下部固定のプライマリボタン（Figma: primary-button） */
export function PrimaryButton({
  label,
  disabled = false,
  onPress,
}: PrimaryButtonProps) {
  return (
    <View className="absolute inset-x-0 bottom-0 bg-white/95 px-5 pb-10 pt-3">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`h-12 items-center justify-center rounded-full ${
          disabled
            ? "bg-election-ink/20"
            : "bg-election-red active:bg-election-red-dark"
        }`}
      >
        <Text className="text-base font-bold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
