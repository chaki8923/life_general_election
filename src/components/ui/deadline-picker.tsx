import { useMemo } from "react";
import { Pressable, Text, View } from "@/tw";

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

/** Figma 2609:22072 — 政策実行期日の選択チップ */
export function GoalDeadlinePicker({ value, onChange }: DeadlinePickerProps) {
  const options = useMemo(
    () => [
      { label: "3日以内", value: endOfDay(3) },
      { label: "1週間以内", value: endOfDay(7) },
      { label: "2週間以内", value: endOfDay(14) },
      { label: "1ヵ月以内", value: endOfDay(30) },
    ],
    []
  );

  return (
    <View className="rounded-lg border border-[#f6f6f6] bg-[#fff6f5] px-4 py-2">
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.label}
              onPress={() => onChange(option.value)}
              className={`h-9 items-center justify-center rounded-full border px-3 ${
                selected
                  ? "border-flow-pink bg-white"
                  : "border-[#eaeef2] bg-white"
              }`}
            >
              <Text className="font-flow-medium text-xs leading-[1.4] text-flow-ink">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
