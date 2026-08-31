import { FlowButton } from "@/components/ui/flow-button";
import { GoalDeadlinePicker } from "@/components/ui/deadline-picker";
import { DESIGN_HEIGHT, useDesignScale } from "@/features/election/layout";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";
import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Animated } from "@/tw/animated";
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
  const translateY = useSharedValue(0);
  const dismissThreshold = useSharedValue(s(DRAG_DISMISS_DISTANCE));
  const sheetHeightShared = useSharedValue(sheetHeight);

  useEffect(() => {
    if (visible) setDeadline(null);
  }, [visible]);

  useEffect(() => {
    sheetHeightShared.value = sheetHeight;
    if (!visible) {
      translateY.value = 0;
      return;
    }
    dismissThreshold.value = Math.min(
      s(DRAG_DISMISS_DISTANCE),
      sheetHeight * 0.22
    );
    translateY.value = 0;
  }, [visible, sheetHeight, s, dismissThreshold, sheetHeightShared, translateY]);

  const closeSheet = () => {
    onClose();
  };

  const sheetPan = Gesture.Pan()
    .activeOffsetY(6)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldDismiss =
        translateY.value > dismissThreshold.value ||
        event.velocityY > DRAG_DISMISS_VELOCITY;

      if (shouldDismiss) {
        translateY.value = withTiming(sheetHeightShared.value, { duration: 200 }, () => {
          runOnJS(closeSheet)();
        });
        return;
      }

      translateY.value = withTiming(0, { duration: 180 });
    });

  const sheetDragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const canSubmit = Boolean(candidate && deadline !== null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Tailwind の bg-black/50 は react-native-css の color-mix 実装で
            alpha 0.25 に落ちるため、rgba を直接指定する */}
        <Pressable
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
        />

        <Animated.View
          entering={SlideInDown.duration(280)}
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
            {/* 2609:22089 — グラブハンドル（タップ領域を広げて下スワイプで閉じる） */}
            <GestureDetector gesture={sheetPan}>
              <View
                className="items-center justify-center"
                style={{
                  marginBottom: s(8),
                  minHeight: s(32),
                }}
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
            </GestureDetector>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                gap: s(16),
                paddingBottom: s(8),
              }}
            >
              <View style={{ gap: s(12) }}>
                <Text
                  className="text-center font-flow text-flow-ink"
                  style={{ fontSize: s(14), lineHeight: s(20) }}
                >
                  この公約・政策を目標に設定しますか？
                </Text>

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
                onPress={() => deadline !== null && onRegister(deadline)}
                className="h-14 w-full"
              />
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
