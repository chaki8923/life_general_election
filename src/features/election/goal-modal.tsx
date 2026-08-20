import { FlowButton } from "@/components/ui/flow-button";
import {
  GoalDeadlinePicker,
  getDefaultDeadline,
} from "@/components/ui/deadline-picker";
import { Pressable, Text, View } from "@/tw";
import { Image } from "@/tw/image";
import type { Candidate } from "@/types";
import { useEffect, useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconFlag = require("../../../assets/election/result/icon-flag.svg");
const iconCheck = require("../../../assets/election/result/icon-check.svg");
const iconCalendar = require("../../../assets/election/result/icon-calendar.svg");

/** 画面高さの 3/5（Figma ボトムシート） */
const SHEET_HEIGHT_RATIO = 0.6;

type GoalModalProps = {
  visible: boolean;
  candidate: Candidate | null;
  onRegister: (deadline: number) => void;
  onClose: () => void;
};

function SectionLabel({
  icon,
  iconClassName,
  label,
}: {
  icon: number;
  iconClassName: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-1 py-1.5">
      <Image
        source={icon}
        className={iconClassName}
        contentFit="contain"
        style={{ tintColor: "#f4728a" }}
      />
      <Text className="font-flow text-sm leading-[1.4] tracking-[-0.48px] text-flow-pink">
        {label}
      </Text>
    </View>
  );
}

/**
 * Figma 2609:22043 — 公約・政策を目標に設定するボトムシート
 */
export function GoalModal({
  visible,
  candidate,
  onRegister,
  onClose,
}: GoalModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setDeadline(getDefaultDeadline());
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
          className="rounded-t-[20px] border border-[#f6f6f6] bg-white px-8 pt-5"
          style={{
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          {/* 2609:22089 — グラブハンドル */}
          <View className="mb-4 h-1 w-[101px] self-center rounded-2xl bg-[#d9d9d9]" />

          <View className="flex-1 justify-evenly">
            <Text className="text-center font-flow text-lg leading-7 text-flow-ink">
              この公約・政策を目標に設定しますか？
            </Text>

            <View className="gap-5">
              {/* 人生公約 */}
              <View className="gap-1 border-b border-[#eaeef2] pb-4">
                <SectionLabel
                  icon={iconFlag}
                  iconClassName="h-4 w-4"
                  label="人生公約"
                />
                <Text className="font-flow-medium text-base leading-6 text-flow-ink">
                  {candidate?.label}
                </Text>
              </View>

              {/* 掲げる政策 */}
              <View className="gap-1 border-b border-[#eaeef2] pb-4">
                <SectionLabel
                  icon={iconCheck}
                  iconClassName="h-[17px] w-[15px]"
                  label="掲げる政策"
                />
                <Text className="font-flow-medium text-base leading-6 text-flow-ink">
                  {candidate?.action}
                </Text>
              </View>

              {/* 政策実行の期日 */}
              <View className="gap-3">
                <SectionLabel
                  icon={iconCalendar}
                  iconClassName="h-5 w-5"
                  label="政策実行の期日"
                />
                <Text className="font-flow-medium text-sm leading-6 tracking-[0.6px] text-flow-ink">
                  忘れないようまずは
                  <Text className="text-flow-pink">3日以内</Text>
                  がおすすめ！
                </Text>
                <GoalDeadlinePicker value={deadline} onChange={setDeadline} />
              </View>
            </View>

            <FlowButton
              label="設定する"
              variant={canSubmit ? "primary" : "gray"}
              disabled={!canSubmit}
              onPress={() => deadline !== null && onRegister(deadline)}
              className="h-14 w-full"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
