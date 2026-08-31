import { GoalDeadlinePicker } from "@/components/ui/deadline-picker";
import { FlowButton } from "@/components/ui/flow-button";
import { DESIGN_HEIGHT, useDesignScale } from "@/features/election/layout";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconFlag = require("../../../assets/election/result/icon-flag.svg");
const iconCheck = require("../../../assets/election/result/icon-check.svg");
const iconCalendar = require("../../../assets/election/result/icon-calendar.svg");

/** Figma アートボード高さに対するシート比率 */
const SHEET_HEIGHT_RATIO = 0.6;
const SHEET_DESIGN_HEIGHT = Math.round(DESIGN_HEIGHT * SHEET_HEIGHT_RATIO);
/** 下スワイプで閉じる距離（デザインpx） */
const DRAG_DISMISS_DISTANCE = 72;
/** 下スワイプで閉じる速度 */
const DRAG_DISMISS_VELOCITY = 900;

const SHEET_OPEN_MS = 280;
const SHEET_DISMISS_MS = 220;
const BACKDROP_OPACITY = 0.5;

type GoalModalProps = {
  visible: boolean;
  candidate: Candidate | null;
  /** 選択カードのアクセント色 */
  color: string;
  /** 選択カードの淡い背景色（avatarBg） */
  accentBg: string;
  onRegister: (deadline: number) => void;
  onClose: () => void;
};

function SectionLabel({
  icon,
  iconWidth,
  iconHeight,
  label,
  color,
}: {
  icon: number;
  iconWidth: number;
  iconHeight: number;
  label: string;
  color: string;
}) {
  const { s } = useDesignScale();
  return (
    <View
      className="flex-row items-center"
      style={{ gap: s(4), paddingVertical: s(2) }}
    >
      <Image
        source={icon}
        contentFit="contain"
        style={{
          width: s(iconWidth),
          height: s(iconHeight),
          tintColor: color,
        }}
      />
      <Text
        className="font-flow"
        style={{
          color,
          fontSize: s(11),
          lineHeight: s(11 * 1.4),
          letterSpacing: s(-0.48),
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Figma 2609:22043 — 公約・政策を目標に設定するボトムシート
 * 高さは幅スケールと画面高さの小さい方に収め、溢れたら内部スクロール。
 */
export function GoalModal({
  visible,
  candidate,
  color,
  accentBg,
  onRegister,
  onClose,
}: GoalModalProps) {
  const { s, height: windowHeight } = useDesignScale();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16) + s(24);
  const maxSheet = Math.max(0, windowHeight - insets.top - s(24));
  const sheetHeight = Math.min(s(SHEET_DESIGN_HEIGHT), maxSheet);
  const [deadline, setDeadline] = useState<number | null>(null);
  const isClosingRef = useRef(false);
  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);
  const dismissThreshold = useSharedValue(s(DRAG_DISMISS_DISTANCE));
  const sheetHeightShared = useSharedValue(sheetHeight);
  const dragStartY = useSharedValue(0);

  const finishDismiss = useCallback(() => {
    isClosingRef.current = false;
    onClose();
  }, [onClose]);

  const animateClose = useCallback(
    (onComplete: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      cancelAnimation(translateY);
      cancelAnimation(backdropOpacity);

      backdropOpacity.value = withTiming(0, {
        duration: SHEET_DISMISS_MS,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(
        sheetHeightShared.value,
        { duration: SHEET_DISMISS_MS, easing: Easing.in(Easing.cubic) },
        () => {
          runOnJS(onComplete)();
        }
      );
    },
    [backdropOpacity, sheetHeightShared, translateY]
  );

  const dismissSheet = useCallback(() => {
    animateClose(finishDismiss);
  }, [animateClose, finishDismiss]);

  const submitGoal = useCallback(() => {
    if (deadline === null) return;
    const selectedDeadline = deadline;
    animateClose(() => {
      isClosingRef.current = false;
      onRegister(selectedDeadline);
    });
  }, [animateClose, deadline, onRegister]);

  // 開く: translateY のみで制御（SlideInDown と二重アニメにしない）
  // 閉じる: translateY を 0 に戻さない（フェードアウト中の跳ね返り防止）
  useEffect(() => {
    if (!visible) return;

    isClosingRef.current = false;
    setDeadline(null);
    sheetHeightShared.value = sheetHeight;
    dismissThreshold.value = Math.min(
      s(DRAG_DISMISS_DISTANCE),
      sheetHeight * 0.22
    );

    cancelAnimation(translateY);
    cancelAnimation(backdropOpacity);
    translateY.value = sheetHeight;
    backdropOpacity.value = 0;

    backdropOpacity.value = withTiming(BACKDROP_OPACITY, {
      duration: SHEET_OPEN_MS,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: SHEET_OPEN_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [
    visible,
    sheetHeight,
    s,
    backdropOpacity,
    dismissThreshold,
    sheetHeightShared,
    translateY,
  ]);

  const sheetPan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onBegin(() => {
      cancelAnimation(translateY);
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, dragStartY.value + event.translationY);
      const progress = Math.min(1, translateY.value / sheetHeightShared.value);
      backdropOpacity.value = BACKDROP_OPACITY * (1 - progress * 0.85);
    })
    .onEnd((event) => {
      const shouldDismiss =
        translateY.value > dismissThreshold.value ||
        event.velocityY > DRAG_DISMISS_VELOCITY;

      if (shouldDismiss) {
        runOnJS(dismissSheet)();
        return;
      }

      backdropOpacity.value = withTiming(BACKDROP_OPACITY, { duration: 180 });
      translateY.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetDragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const canSubmit = Boolean(candidate && deadline !== null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissSheet}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, backdropStyle]}
        >
          <Pressable
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }]}
            onPress={dismissSheet}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
          />
        </Animated.View>

        <Animated.View
          className="overflow-hidden rounded-t-[20px] border border-[#f6f6f6] bg-white"
          style={[
            {
              height: sheetHeight,
              paddingBottom: bottomPad,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 8,
            },
            sheetDragStyle,
          ]}
        >
          <View
            style={{
              paddingHorizontal: s(32),
              paddingTop: s(8),
              flex: 1,
            }}
          >
            {/* ハンドル＋見出しまでスワイプで閉じられる */}
            <GestureDetector gesture={sheetPan}>
              <View style={{ marginBottom: s(8) }}>
                <View
                  className="items-center justify-center"
                  style={{ minHeight: s(32) }}
                  accessibilityRole="adjustable"
                  accessibilityLabel="下にスワイプして閉じる"
                >
                  <View
                    className="rounded-2xl bg-[#d9d9d9]"
                    style={{
                      height: s(4),
                      width: s(101),
                    }}
                  />
                </View>
                <Text
                  className="text-center font-flow text-flow-ink"
                  style={{
                    fontSize: s(14),
                    lineHeight: s(20),
                    marginTop: s(4),
                  }}
                >
                  この公約・政策を目標に設定しますか？
                </Text>
              </View>
            </GestureDetector>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                gap: s(16),
                paddingBottom: s(8),
              }}
            >
              <View style={{ gap: s(12) }}>
                <View style={{ gap: s(12) }}>
                  <View
                    className="border-b border-[#eaeef2]"
                    style={{ gap: s(4), paddingBottom: s(10) }}
                  >
                    <SectionLabel
                      icon={iconFlag}
                      iconWidth={13}
                      iconHeight={13}
                      label="人生公約"
                      color={color}
                    />
                    <Text
                      className="font-flow-medium text-flow-ink"
                      style={{ fontSize: s(13), lineHeight: s(18) }}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {candidate?.label}
                    </Text>
                  </View>

                  <View
                    className="border-b border-[#eaeef2]"
                    style={{ gap: s(4), paddingBottom: s(10) }}
                  >
                    <SectionLabel
                      icon={iconCheck}
                      iconWidth={12}
                      iconHeight={14}
                      label="掲げる政策"
                      color={color}
                    />
                    <Text
                      className="font-flow-medium text-flow-ink"
                      style={{ fontSize: s(13), lineHeight: s(18) }}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {candidate?.action}
                    </Text>
                  </View>

                  <View style={{ gap: s(10) }}>
                    <SectionLabel
                      icon={iconCalendar}
                      iconWidth={14}
                      iconHeight={14}
                      label="政策実行の期日"
                      color={color}
                    />
                    <Text
                      className="font-flow-medium text-flow-ink"
                      style={{
                        fontSize: s(11),
                        lineHeight: s(16),
                        letterSpacing: s(0.6),
                      }}
                    >
                      忘れないようまずは
                      <Text style={{ color }}>3日以内</Text>
                      がおすすめ！
                    </Text>
                    <GoalDeadlinePicker
                      value={deadline}
                      onChange={setDeadline}
                      color={color}
                      accentBg={accentBg}
                    />
                  </View>
                </View>
              </View>

              <FlowButton
                label="設定する"
                variant="primary"
                disabled={!canSubmit}
                fillColor={color}
                disabledFillColor="#D0D7DE"
                onPress={submitGoal}
                className="h-14 w-full"
              />
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
