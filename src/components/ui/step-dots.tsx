import { View } from "@/tw";

type StepDotsProps = {
  total: number;
  /** 0始まりの現在ステップ */
  current: number;
};

/** 選挙フローのステップインジケータ（Figma: 3ドット） */
export function StepDots({ total, current }: StepDotsProps) {
  return (
    <View className="flex-row justify-center gap-3.5">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={`h-4 w-4 rounded-full ${
            i === current ? "bg-election-ink/60" : "bg-election-ink/15"
          }`}
        />
      ))}
    </View>
  );
}
