import { View } from "@/tw";

const COLS = 10;
const ROWS = 5;

type VoteIconGridProps = {
  color: string;
};

/** 得票の「みんなが選んだ」感を出す装飾グリッド（件数は別テキストで表示） */
export function VoteIconGrid({ color }: VoteIconGridProps) {
  return (
    <View className="flex-row flex-wrap gap-[3px]" style={{ width: COLS * 11 }}>
      {Array.from({ length: COLS * ROWS }, (_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 10,
            borderRadius: 4,
            backgroundColor: color,
            opacity: 0.85 - (i % 7) * 0.04,
          }}
        />
      ))}
    </View>
  );
}
