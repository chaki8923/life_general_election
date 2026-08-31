import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { FlowButton } from "@/components/ui/flow-button";
import { Pressable, Text, TextInput, View } from "@/tw";

export const CUSTOM_INTEREST_MAX_LENGTH = 40;

type Props = {
  visible: boolean;
  /** 入力済みの内容（開き直したときの初期値） */
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

/**
 * 「その他」の興味・関心を自由入力する。
 * 新デザインはカードの直下にCTAが来るので、インライン入力だとCTAがキーボードに隠れてしまう。
 */
export function CustomInterestModal({
  visible,
  value,
  onConfirm,
  onClose,
}: Props) {
  const [draft, setDraft] = useState(value);

  // 開くたびに確定済みの値へ戻す（前回のキャンセル分を持ち越さない）
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const trimmed = draft.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="閉じる"
        className="flex-1 items-center justify-center bg-black/50 px-[20px]"
      >
        <View
          onStartShouldSetResponder={() => true}
          className="w-full max-w-[350px] gap-[12px] rounded-[24px] bg-white p-[24px]"
        >
          <Text className="text-center font-flow text-[18px] leading-[26px] text-flow-ink">
            興味・関心を入力
          </Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="例：子育て、地域活動、ペット"
            placeholderTextColor="#6e7781"
            maxLength={CUSTOM_INTEREST_MAX_LENGTH}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => trimmed && onConfirm(trimmed)}
            accessibilityLabel="その他の興味・関心"
            className="rounded-[12px] border-2 border-flow-pink bg-white px-4 py-3 font-flow-medium text-[16px] text-flow-ink"
          />
          <Text className="text-right font-flow-regular text-[12px] text-flow-ink-low">
            {draft.length}/{CUSTOM_INTEREST_MAX_LENGTH}
          </Text>

          <FlowButton
            label="決定"
            disabled={!trimmed}
            onPress={() => onConfirm(trimmed)}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
