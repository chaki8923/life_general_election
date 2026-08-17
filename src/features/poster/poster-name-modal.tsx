import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { Pressable, Text, TextInput, View } from "@/tw";
import { ModalPrimaryButton, ModalTextButton } from "./modal-buttons";
import { NAME_MAX_LENGTH } from "./templates";

type Props = {
  visible: boolean;
  /** 現在のポスター名 */
  value: string;
  /** 未入力時に薄く出す名前（プロフィールのニックネーム） */
  placeholder: string;
  onSave: (name: string) => void;
  onClose: () => void;
};

/**
 * ポスターの氏名帯に出す名前を変えるモーダル（公約ごとに保存される）。
 * Figma に該当画面がないので、削除モーダル（2040:6515）と同じ白カード様式に合わせた。
 */
export function PosterNameModal({
  visible,
  value,
  placeholder,
  onSave,
  onClose,
}: Props) {
  const [draft, setDraft] = useState(value);

  // 開くたびに保存済みの値へ戻す（前回のキャンセル分を持ち越さない）
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

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
          className="w-full max-w-[350px] items-center gap-[12px] rounded-[24px] bg-white p-[24px]"
        >
          <Text className="w-full text-center font-flow text-[18px] leading-[26px] text-flow-ink">
            ニックネームを変更
          </Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            maxLength={NAME_MAX_LENGTH}
            placeholder={
              placeholder || `例: 山田太郎（${NAME_MAX_LENGTH}文字まで）`
            }
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => onSave(draft)}
            className="w-full rounded-[12px] border-2 border-[#e6e6e6] bg-white px-4 py-3 font-flow-medium text-[16px] text-flow-ink"
          />

          <View className="w-full gap-[8px]">
            <ModalPrimaryButton label="保存する" onPress={() => onSave(draft)} />
            <ModalTextButton label="閉じる" onPress={onClose} />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
