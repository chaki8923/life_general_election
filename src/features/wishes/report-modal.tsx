import { useEffect, useState } from "react";
import { ActivityIndicator, Modal } from "react-native";
import { generateExcuse } from "@/features/excuse/generate";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

type ReportModalProps = {
  visible: boolean;
  wish: Wish;
  onClose: () => void;
};

type ModalState = "select" | "loading" | "excuse";

export function ReportModal({ visible, wish, onClose }: ReportModalProps) {
  const markDone = useWishStore((state) => state.markDone);
  const markExcused = useWishStore((state) => state.markExcused);
  const [state, setState] = useState<ModalState>("select");
  const [excuse, setExcuse] = useState("");

  useEffect(() => {
    if (visible) {
      setState("select");
      setExcuse("");
    }
  }, [visible]);

  const reportDone = () => {
    const updated = markDone(wish.id);
    if (updated) mirrorWish(updated);
    onClose();
  };

  const createExcuse = async () => {
    setState("loading");
    const generated = await generateExcuse({ wish });
    setExcuse(generated);
    setState("excuse");
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
      onRequestClose={state === "loading" ? undefined : onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-lg rounded-2xl bg-white p-5">
          {state === "select" ? (
            <>
              <Text className="text-base font-bold text-[#333333]">
                実施結果を報告する
              </Text>
              <Text className="mt-3 text-sm text-[#555555]">
                {wish.policy ?? wish.text}
              </Text>
              <Pressable
                onPress={reportDone}
                className="mt-6 h-12 items-center justify-center rounded-full bg-[#555555]"
              >
                <Text className="text-base font-bold text-white">できた</Text>
              </Pressable>
              <Pressable
                onPress={createExcuse}
                className="mt-3 h-12 items-center justify-center rounded-full border-2 border-[#737373]"
              >
                <Text className="text-base font-bold text-[#555555]">
                  言い訳を生成する
                </Text>
              </Pressable>
              <Pressable onPress={onClose} className="items-center py-4">
                <Text className="text-sm font-bold text-[#999999]">閉じる</Text>
              </Pressable>
            </>
          ) : state === "loading" ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#555555" size="large" />
              <Text className="mt-4 text-sm font-bold text-[#555555]">
                やさしい言い訳を考えています…
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-base font-bold text-[#333333]">
                今日の言い訳
              </Text>
              <View className="mt-4 rounded-xl bg-[#f8f8f8] p-4">
                <Text className="text-sm leading-6 text-[#333333]">{excuse}</Text>
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
