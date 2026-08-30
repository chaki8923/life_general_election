import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform } from "react-native";
import { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlowButton } from "@/components/ui/flow-button";
import { Animated } from "@/tw/animated";
import { Pressable, Text, TextInput } from "@/tw";

export const CUSTOM_INTEREST_MAX_LENGTH = 40;

/** シート左右の余白。ポスターのニックネーム入力（poster-name-modal）と揃える */
const SHEET_PADDING = 24;

type Props = {
  visible: boolean;
  /** 入力済みの内容（開き直したときの初期値） */
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

/**
 * 「その他」の興味・関心を自由入力する。
 * インライン入力だとCTAがキーボードに隠れてしまうのでモーダルに出す。
 * 見た目は同じ「ラベル＋1行入力＋確定」であるポスターのニックネーム入力
 * （poster-name-modal）に合わせ、下から出る白いシート様式で揃えている。
 */
export function CustomInterestModal({
  visible,
  value,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
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
          {/* シート内のタップで閉じないよう、ここでタッチを止める */}
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
              className="w-full rounded-[12px] border-2 border-flow-pink bg-white px-4 py-3 font-flow-medium text-[16px] text-flow-ink"
            />
            <Text className="w-full text-right font-flow-regular text-[12px] text-flow-ink-low">
              {draft.length}/{CUSTOM_INTEREST_MAX_LENGTH}
            </Text>

            <FlowButton
              label="決定"
              className="w-full"
              disabled={!trimmed}
              onPress={() => onConfirm(trimmed)}
            />
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
