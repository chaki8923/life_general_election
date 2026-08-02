import { Text, View } from "@/tw";
import { formatDate } from "@/utils/date";
import type { Wish } from "@/types";

/**
 * 過去の政策1件（Figma: 過去の政策_できた 456-631 の Frame 627525）。
 * バッジ・政策名・日付を中央寄せで積む。
 */
export function PolicyRecordCard({ wish }: { wish: Wish }) {
  const done = wish.status === "done";

  return (
    <View className="items-center rounded-2xl bg-white px-5 py-5">
      <View
        className={`rounded-full px-3 py-1 ${
          done ? "bg-flow-gray" : "bg-[#999999]"
        }`}
      >
        <Text className="text-xs font-bold text-white">
          {done ? "実行した政策" : "できなかった政策"}
        </Text>
      </View>

      <Text className="mt-4 text-center text-base font-bold text-flow-ink">
        {wish.policy ?? wish.text}
      </Text>

      <Text className="mt-3 text-xs text-[#737373]">
        策定日：{formatDate(wish.createdAt)}
      </Text>
      {done && wish.doneAt !== undefined ? (
        <Text className="mt-1 text-xs text-[#737373]">
          達成日：{formatDate(wish.doneAt)}
        </Text>
      ) : null}
      {!done && wish.excusedAt !== undefined ? (
        <Text className="mt-1 text-xs text-[#737373]">
          報告日：{formatDate(wish.excusedAt)}
        </Text>
      ) : null}

      {!done && wish.excuse ? (
        <View className="mt-4 w-full rounded-xl bg-[#f8f8f8] p-3">
          <Text className="text-xs font-bold text-[#999999]">言い訳</Text>
          <Text className="mt-1 text-sm leading-6 text-[#555555]">
            {wish.excuse}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
