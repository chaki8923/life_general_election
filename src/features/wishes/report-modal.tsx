import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal } from "react-native";
import { generateExcuse } from "@/features/excuse/generate";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

export type ReportAction = "done" | "excuse";

type ReportModalProps = {
  visible: boolean;
  wish: Wish;
  action: ReportAction;
  onClose: () => void;
};

type ModalState = "done" | "loading" | "excuse";

export function ReportModal({
  visible,
  wish,
  action,
  onClose,
}: ReportModalProps) {
  const markDone = useWishStore((state) => state.markDone);
  const markExcused = useWishStore((state) => state.markExcused);
  const [state, setState] = useState<ModalState>("done");
  const [excuse, setExcuse] = useState("");
  const requestId = useRef(0);

  const createExcuse = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setState("loading");
    const generated = await generateExcuse({ wish });
    if (requestId.current !== currentRequest) return;
    setExcuse(generated);
    setState("excuse");
  }, [wish]);

  useEffect(() => {
    if (!visible) {
      requestId.current += 1;
      return;
    }
    setExcuse("");
    if (action === "done") {
      setState("done");
    } else {
      createExcuse();
    }
    return () => {
      requestId.current += 1;
    };
  }, [action, createExcuse, visible]);

  const confirmDone = () => {
    const updated = markDone(wish.id);
    if (updated) mirrorWish(updated);
    onClose();
  };

  const confirmExcuse = () => {
    const updated = markExcused(wish.id, excuse);
    if (updated) mirrorWish(updated);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-lg rounded-2xl bg-white p-5">
          {state === "done" ? (
            <>
              <Text className="text-lg font-bold text-[#333333]">
                この公約を達成にしますか？
              </Text>
              <Text className="mt-3 text-sm leading-6 text-[#555555]">
                {wish.policy ?? wish.text}
              </Text>
              <Pressable
                onPress={confirmDone}
                className="mt-6 h-12 items-center justify-center rounded-full bg-[#555555]"
              >
                <Text className="text-base font-bold text-white">
                  達成として記録する
                </Text>
              </Pressable>
              <Pressable onPress={onClose} className="items-center py-4">
                <Text className="text-sm font-bold text-[#999999]">
                  キャンセル
                </Text>
              </Pressable>
            </>
          ) : state === "loading" ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#555555" size="large" />
              <Text className="mt-4 text-sm font-bold text-[#555555]">
                やさしい言い訳を考えています…
              </Text>
              <Pressable onPress={onClose} className="mt-5 px-6 py-3">
                <Text className="text-sm font-bold text-[#999999]">閉じる</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-base font-bold text-[#333333]">
                今日の言い訳
              </Text>
              <View className="mt-4 rounded-xl bg-[#f8f8f8] p-4">
                <Text className="text-sm leading-6 text-[#333333]">
                  {excuse}
                </Text>
              </View>
              <Pressable
                onPress={confirmExcuse}
                className="mt-5 h-12 items-center justify-center rounded-full bg-[#555555]"
              >
                <Text className="text-base font-bold text-white">
                  この言い訳で報告する
                </Text>
              </Pressable>
              <Pressable onPress={createExcuse} className="items-center py-4">
                <Text className="text-sm font-bold text-[#737373]">
                  もう一度生成する
                </Text>
              </Pressable>
              <Pressable onPress={onClose} className="items-center pb-2">
                <Text className="text-sm font-bold text-[#999999]">閉じる</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
