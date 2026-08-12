import { View } from "@/tw";

/** Figma progress-step 1012:3606 */
const DOT_ACTIVE = "#24292f";
const DOT_INACTIVE = "#afb8c1";

type ResultProgressDotsProps = {
  total?: number;
  current?: number;
};

/**
 * マイノリティカルーセルのページドット（Figma 1012:3606 progress-bar-step4）
 */
export function ResultProgressDots({
  total = 2,
  current = 0,
}: ResultProgressDotsProps) {
  return (
    <View className="w-full flex-row items-center justify-center gap-3 px-4 py-2">
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: index === current ? DOT_ACTIVE : DOT_INACTIVE,
          }}
        />
      ))}
    </View>
  );
}
