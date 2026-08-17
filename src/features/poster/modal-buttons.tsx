import { Pressable, Text, View } from "@/tw";

/**
 * ポスター系モーダルのボタン（Figma 2040:6541 / 2040:6542）。
 *
 * このプロジェクトの rem は 14px なので、`h-12` は 48 ではなく 42 になる。
 * Figma 実測値どおりに出したいところは rem 依存のユーティリティを使わず px で書く。
 */

type Props = {
  label: string;
  onPress: () => void;
};

/** 黒い pill（幅100% / 高さ48 / radius32 / Bold 16px 白） */
export function ModalPrimaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-[48px] w-full items-center justify-center rounded-[32px] bg-black px-[24px] active:opacity-80"
    >
      <View>
        <Text className="font-flow text-[16px] text-white">{label}</Text>
      </View>
    </Pressable>
  );
}

/** 枠なしのテキストリンク（幅100% / 高さ46 / Regular 14px グレー） */
export function ModalTextButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-[46px] w-full items-center justify-center active:opacity-60"
    >
      <Text className="font-flow-regular text-[14px] text-[#999999]">
        {label}
      </Text>
    </Pressable>
  );
}
