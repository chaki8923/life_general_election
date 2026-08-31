import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  type TextInput as RNTextInput,
  useWindowDimensions,
} from "react-native";
import {
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlowButton } from "@/components/ui/flow-button";
import { Animated } from "@/tw/animated";
import { Pressable, Text, TextInput, View } from "@/tw";

export const CUSTOM_INTEREST_MAX_LENGTH = 40;

/** シート左右の余白。ポスターのニックネーム入力（poster-name-modal）と揃える */
const SHEET_PADDING = 24;
const SHEET_ANIMATION_MS = 280;

type Props = {
  visible: boolean;
  /** 入力済みの内容（開き直したときの初期値） */
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

/**
 * 「その他」の興味・関心を自由入力する。
 * インライン入力だとCTAがキーボードに隠れてしまうので、画面全面に重ねて出す。
 *
 * RNのModalは使わず、非表示中も入力シートをマウントしておく。初回タップ時に
 * TextInputの生成・レイアウトとキーボード初期化が重ならないので、シートと
 * キーボードの表示を同時に始められる。
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
  const { height: windowHeight } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<RNTextInput>(null);
  const [draft, setDraft] = useState(value);
  const openProgress = useSharedValue(0);

  // 開くたびに確定済みの値へ戻す（前回のキャンセル分を持ち越さない）
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  useEffect(() => {
    if (!visible) {
      inputRef.current?.blur();
      openProgress.value = reduceMotion
        ? 0
        : withTiming(0, { duration: SHEET_ANIMATION_MS });
      return;
    }

    // シートは既にネイティブツリー上にある。同じフレームで表示とfocusを始め、
    // 初回だけキーボードが先に見える状態を作らない。
    const id = requestAnimationFrame(() => {
      openProgress.value = reduceMotion
        ? 1
        : withTiming(1, { duration: SHEET_ANIMATION_MS });
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [openProgress, reduceMotion, visible]);

  // Modalをやめたぶん、Androidのバックキーは自前で拾う
  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
  }));

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: windowHeight * (1 - openProgress.value) },
      ],
    };
  }, [windowHeight]);

  const trimmed = draft.trim();

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      className="absolute inset-0"
    >
      <Animated.View className="absolute inset-0" style={backdropStyle}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      </Animated.View>

      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Animated.View
          className="items-center gap-[12px] rounded-t-[24px] bg-white"
          style={[
            sheetStyle,
            {
              paddingTop: SHEET_PADDING,
              paddingHorizontal: SHEET_PADDING,
              paddingBottom: SHEET_PADDING + insets.bottom,
            },
          ]}
        >
          <Text className="w-full text-center font-flow text-[18px] leading-[26px] text-flow-ink">
            興味・関心を入力
          </Text>

          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            placeholder="例：子育て、地域活動、ペット"
            placeholderTextColor="#6e7781"
            maxLength={CUSTOM_INTEREST_MAX_LENGTH}
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
      </KeyboardAvoidingView>
    </View>
  );
}
