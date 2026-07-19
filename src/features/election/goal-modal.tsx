import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { DeadlinePicker, getDefaultDeadline } from "@/components/ui/deadline-picker";
import { Pressable, Text, View } from "@/tw";
import type { Candidate } from "@/types";

type GoalModalProps = {
  visible: boolean;
  candidate: Candidate | null;
  onRegister: (deadline: number) => void;
  onClose: () => void;
};

export function GoalModal({
  visible,
  candidate,
  onRegister,
  onClose,
}: GoalModalProps) {
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setDeadline(getDefaultDeadline());
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-lg rounded-2xl bg-white p-5">
          <Text className="text-base font-bold text-[#333333]">
            この目標を立てますか?
          </Text>

          <View className="mt-4 gap-4 rounded-xl bg-[#f8f8f8] p-4">
            <View>
              <View className="self-start rounded-full bg-[#737373] px-3 py-1">
                <Text className="text-xs font-bold text-white">人生公約</Text>
              </View>
              <Text className="mt-2 text-sm font-bold text-[#333333]">
                {candidate?.label}
              </Text>
            </View>
            <View>
              <View className="self-start rounded-full bg-[#737373] px-3 py-1">
                <Text className="text-xs font-bold text-white">掲げる政策</Text>
              </View>
              <Text className="mt-2 text-sm text-[#333333]">
                {candidate?.action}
              </Text>
            </View>
            <DeadlinePicker value={deadline} onChange={setDeadline} />
          </View>

          <Pressable
            onPress={() => deadline !== null && onRegister(deadline)}
            disabled={!candidate || deadline === null}
            className="mt-5 h-12 items-center justify-center rounded-full bg-[#555555]"
          >
            <Text className="text-base font-bold text-white">登録する</Text>
          </Pressable>
          <Pressable onPress={onClose} className="items-center py-4">
            <Text className="text-sm font-bold text-[#999999]">閉じる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
