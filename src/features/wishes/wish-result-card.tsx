import { Text, View } from "@/tw";
import { formatDate } from "@/utils/date";
import type { Wish } from "@/types";

/** 達成(done)・未達成(excused)になった公約の履歴カード */
export function WishResultCard({ wish }: { wish: Wish }) {
  const done = wish.status === "done";

  return (
    <View
      className={`rounded-xl bg-white p-4 shadow-sm ${
        done ? "border-2 border-election-red" : ""
      }`}
    >
      <View className="flex-row items-center gap-2">
        <View
          className={`rounded-full px-3 py-1 ${
            done ? "bg-election-red" : "bg-[#999999]"
          }`}
        >
          <Text className="text-xs font-bold text-white">
            {done ? "達成" : "未達成"}
          </Text>
        </View>
        {done && wish.doneAt !== undefined ? (
          <Text className="text-xs text-[#737373]">
            達成日:{formatDate(wish.doneAt)}
          </Text>
        ) : !done && wish.excusedAt !== undefined ? (
          <Text className="text-xs text-[#737373]">
            報告日:{formatDate(wish.excusedAt)}
          </Text>
        ) : null}
      </View>
      <Text
        className={`mt-3 text-base font-bold ${
          done ? "text-[#333333]" : "text-[#737373]"
        }`}
      >
        {wish.policy ?? wish.text}
      </Text>
      {!done && wish.excuse ? (
        <View className="mt-3 rounded-xl bg-[#f8f8f8] p-3">
          <Text className="text-xs font-bold text-[#999999]">言い訳</Text>
          <Text className="mt-1 text-sm leading-6 text-[#555555]">
            {wish.excuse}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
