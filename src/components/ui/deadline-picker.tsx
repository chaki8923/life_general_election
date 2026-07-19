import { useMemo } from "react";
import { Text, View } from "@/tw";
import { OptionChip } from "@/components/ui/option-chip";

type DeadlinePickerProps = {
  value: number | null;
  onChange: (value: number) => void;
};

function endOfDay(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function getDefaultDeadline() {
  return endOfDay(3);
}

export function DeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const options = useMemo(
    () => [
      { label: "今日", value: endOfDay(0) },
      { label: "明日", value: endOfDay(1) },
      { label: "3日後", value: endOfDay(3) },
      { label: "1週間後", value: endOfDay(7) },
    ],
    []
  );

  return (
    <View>
      <Text className="text-sm font-bold text-[#333333]">期日</Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {options.map((option) => (
          <OptionChip
            key={option.label}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}
