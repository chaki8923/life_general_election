import { useState } from "react";
import { ReportModal } from "@/features/wishes/report-modal";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export function WishPolicyCard({ wish }: { wish: Wish }) {
  const [reportVisible, setReportVisible] = useState(false);
  const overdue = wish.deadline !== undefined && wish.deadline < Date.now();

  return (
    <>
      <View className="rounded-xl bg-white p-4 shadow-sm">
        <Text className="text-base font-bold text-[#333333]">
          {wish.policy ?? wish.text}
        </Text>
        <Text
          className={`mt-2 text-sm ${overdue ? "text-[#ff2626]" : "text-[#555555]"}`}
        >
          策定日:{formatDate(wish.createdAt)}
        </Text>
        <Pressable
          onPress={() => setReportVisible(true)}
          className="mt-4 h-12 items-center justify-center rounded-full bg-[#737373]"
        >
          <Text className="text-sm font-bold text-white">実施結果を報告する</Text>
        </Pressable>
      </View>
      <ReportModal
        visible={reportVisible}
        wish={wish}
        onClose={() => setReportVisible(false)}
      />
    </>
  );
}
