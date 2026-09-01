import { Modal } from "react-native";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

type ReportModalProps = {
  visible: boolean;
  wish: Wish;
  onClose: () => void;
  /** 達成として記録できたときだけ呼ばれる（完了画面への遷移用） */
  onCompleted?: () => void;
};

/**
 * 「できた！」の達成確認。
 * 「できなかった」は /wishes/excuse の全画面フローに分かれている。
 */
export function ReportModal({
  visible,
  wish,
  onClose,
  onCompleted,
}: ReportModalProps) {
  const markDone = useWishStore((state) => state.markDone);

  const confirmDone = () => {
    const updated = markDone(wish.id);
    if (updated) mirrorWish(updated);
    // 記録できたときはここで閉じない。閉じるとマイページ側の「一覧に残す印」が
    // クリアされ、公約が消えた直後のマイページが遷移前に見えてしまう
    if (updated) {
      onCompleted?.();
      return;
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="w-full max-w-lg rounded-2xl bg-white p-5">
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
        </View>
      </View>
    </Modal>
  );
}
