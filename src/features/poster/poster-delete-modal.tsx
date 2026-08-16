import { Modal } from "react-native";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";
import { ModalPrimaryButton, ModalTextButton } from "./modal-buttons";

const flagIcon = require("../../../assets/poster/icon-flag.svg");
const checkboxIcon = require("../../../assets/poster/icon-checkbox.svg");

/** Figma 2040:6515。タイトルだけ navy、バッジはピンク */
const TITLE_INK = "#1f2741";
const BADGE_INK = "#f4728a";
const CARD_BORDER = "#eeeeee";
const DETAILS_BG = "#f8f8f8";

type RowProps = {
  icon: number;
  iconWidth: number;
  iconHeight: number;
  label: string;
  value: string;
};

function DetailRow({ icon, iconWidth, iconHeight, label, value }: RowProps) {
  return (
    <View>
      <View className="flex-row items-center gap-[3px] py-[4px]">
        <Image
          source={icon}
          style={{ width: iconWidth, height: iconHeight }}
          contentFit="contain"
        />
        <Text
          className="font-flow text-[12px]"
          style={{ color: BADGE_INK, lineHeight: 16.8, letterSpacing: -0.48 }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="font-flow text-[16px] text-flow-ink"
        style={{ lineHeight: 24, letterSpacing: 0.8 }}
      >
        {value}
      </Text>
    </View>
  );
}

type Props = {
  visible: boolean;
  wish: Wish;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * 公約の削除確認（Figma 2040:6449 → 2040:6515）。
 * 削除そのものは呼び出し側が担う（写真ファイルの後始末が要るため）。
 */
export function PosterDeleteModal({ visible, wish, onConfirm, onClose }: Props) {
  const policy = wish.policy?.trim();

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
        {/* カード内のタップで閉じないよう、ここでタッチを止める */}
        <View
          onStartShouldSetResponder={() => true}
          className="w-full max-w-[350px] items-center gap-[12px] rounded-[24px] bg-white p-[24px]"
        >
          <View
            className="w-full items-center gap-[16px] rounded-[20px] bg-white p-[20px]"
            style={{
              borderWidth: 1,
              borderColor: CARD_BORDER,
              boxShadow: "0px 1px 1.5px rgba(0,0,0,0.08)",
            }}
          >
            <Text
              className="w-full text-center font-flow text-[18px] leading-[26px]"
              style={{ color: TITLE_INK }}
            >
              この目標を削除しますか？
            </Text>

            <View
              className="w-full gap-[8px] rounded-[12px] p-[12px]"
              style={{ backgroundColor: DETAILS_BG }}
            >
              <DetailRow
                icon={flagIcon}
                iconWidth={19}
                iconHeight={19}
                label="人生公約"
                value={wish.text}
              />
              {policy ? (
                <DetailRow
                  icon={checkboxIcon}
                  iconWidth={16}
                  iconHeight={18}
                  label="掲げる政策"
                  value={policy}
                />
              ) : null}
            </View>
          </View>

          <View className="w-full gap-[8px]">
            <ModalPrimaryButton label="削除する" onPress={onConfirm} />
            <ModalTextButton label="閉じる" onPress={onClose} />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
