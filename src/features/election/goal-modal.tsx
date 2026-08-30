import { FlowButton } from "@/components/ui/flow-button";
import { GoalDeadlinePicker } from "@/components/ui/deadline-picker";
import { DESIGN_HEIGHT, useDesignScale } from "@/features/election/layout";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";
import { useEffect, useState } from "react";
import { Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconFlag = require("../../../assets/election/result/icon-flag.svg");
const iconCheck = require("../../../assets/election/result/icon-check.svg");
const iconCalendar = require("../../../assets/election/result/icon-calendar.svg");

/** Figma アートボード高さに対するシート比率 */
const SHEET_HEIGHT_RATIO = 0.6;
const SHEET_DESIGN_HEIGHT = Math.round(DESIGN_HEIGHT * SHEET_HEIGHT_RATIO);

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

  useEffect(() => {
    if (visible) setDeadline(null);
  }, [visible]);

  const canSubmit = Boolean(candidate && deadline !== null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
        />

        <View
          className="overflow-hidden rounded-t-[20px] border border-[#f6f6f6] bg-white"
          style={{
            height: sheetHeight,
            paddingBottom: bottomPad,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <View
            style={{
              paddingHorizontal: s(32),
              paddingTop: s(20),
              flex: 1,
            }}
          >
            {/* 2609:22089 — グラブハンドル */}
            <View
              className="self-center rounded-2xl bg-[#d9d9d9]"
              style={{
                marginBottom: s(16),
                height: s(4),
                width: s(101),
              }}
            />

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
        </View>
      </View>
    </Modal>
  );
}
