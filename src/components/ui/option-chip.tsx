import { Pressable, Text } from "@/tw";

type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** 年代・性別などの選択式項目で使う単一選択チップ */
export function OptionChip({ label, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border-2 px-4 py-3 ${
        selected
          ? "border-election-red bg-election-red"
          : "border-election-ink/10 bg-election-paper"
      }`}
    >
      <Text
        className={`text-sm font-bold ${
          selected ? "text-white" : "text-election-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
