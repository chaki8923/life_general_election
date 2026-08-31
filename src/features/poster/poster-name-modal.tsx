import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform } from "react-native";
import { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated } from "@/tw/animated";
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

/** シート左右の余白。編集シート（poster-edit-modal）と揃える */
const SHEET_PADDING = 24;

/**
 * ポスターの氏名帯に出す名前を変えるモーダル（公約ごとに保存される）。
 * Figma に該当画面がないので、同じ流れで開く編集シート（2040:6437）と同じ
 * 「下から出る白いシート」様式に合わせた。
 */
export function PosterNameModal({
  visible,
  value,
  placeholder,
  onSave,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
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
      {/* 下端固定のシートなので、autoFocus で出るキーボードに押し上げてもらう */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <Animated.View
            entering={SlideInDown.duration(280)}
            onStartShouldSetResponder={() => true}
            className="items-center gap-[12px] rounded-t-[24px] bg-white"
            style={{
              paddingTop: SHEET_PADDING,
              paddingHorizontal: SHEET_PADDING,
              paddingBottom: SHEET_PADDING + insets.bottom,
            }}
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
              <ModalPrimaryButton
                label="保存する"
                onPress={() => onSave(draft)}
              />
              <ModalTextButton label="閉じる" onPress={onClose} />
            </View>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
