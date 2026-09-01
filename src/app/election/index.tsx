import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { ElectionFlowStepper } from "@/features/election/election-flow-stepper";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CHARACTER_WIDTH,
  CHARACTER_X,
  CHARACTER_Y,
  INTERESTS,
  LABEL_INSET,
  type Interest,
} from "@/constants/interests";
import { WORRIES_IMAGES } from "@/constants/election-images";
import { CustomInterestModal } from "@/features/election/custom-interest-modal";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { incrementThemeStat } from "@/services/firebase/mirror";
import { useElectionStore } from "@/stores/election";
import { Image } from "@/tw/image";
import { Pressable, ScrollView, Text, View } from "@/tw";

const OTHER_INTEREST_ID = "other";
/** 画面左右のpadding(20)とカード間のgap(8) */
const GRID_PADDING = 20;
const GRID_GAP = 8;
const CARD_BORDER = "#f6f6f6";

type InterestCardProps = {
  item: Interest;
  label: string;
  selected: boolean;
  /** Figmaのカード171px幅から実機幅への縮尺 */
  scale: number;
  onPress: () => void;
};

function InterestCard({
  item,
  label,
  selected,
  scale,
  onPress,
}: InterestCardProps) {
  const s = (value: number) => value * scale;
  const art = selected ? item.iconActive : item.iconIdle;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className="overflow-hidden rounded-[8px] border"
      style={{
        width: s(CARD_WIDTH),
        height: s(CARD_HEIGHT),
        borderColor: CARD_BORDER,
        backgroundColor: selected ? item.activeBg : "#ffffff",
      }}
    >
      <Image
        source={item.icon}
        contentFit="contain"
        style={{
          position: "absolute",
          left: s(art.x),
          top: s(art.y),
          width: s(art.w),
          height: s(art.h),
        }}
      />
      <Text
        numberOfLines={1}
        className="absolute font-flow-medium text-[#1f1f1f]"
        style={{
          left: s(LABEL_INSET),
          top: s(LABEL_INSET),
          width: s(CARD_WIDTH - LABEL_INSET * 2),
          fontSize: s(14),
          lineHeight: s(19.6),
        }}
      >
        {label}
      </Text>
      {/* とぴょっこは最前面。カード下端からはみ出す前提でoverflow-hiddenで切る */}
      {selected ? (
        <Image
          source={item.character}
          contentFit="contain"
          style={{
            position: "absolute",
            left: s(CHARACTER_X),
            top: s(CHARACTER_Y),
            width: s(CHARACTER_WIDTH),
            height: s(item.characterHeight),
          }}
        />
      ) : null}
    </Pressable>
  );
}

export default function InterestSelectScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { fromProfile } = useLocalSearchParams<{ fromProfile?: string }>();
  const showProfileStep = fromProfile === "1";
  const setInterest = useElectionStore((s) => s.setInterest);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customInterest, setCustomInterest] = useState("");
  const [customOpen, setCustomOpen] = useState(false);

  // テーマを選んでいる間に、次の悩み候補画面の重い背景とキャラを読んでおく
  usePreloadImages(WORRIES_IMAGES);

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
  const scale = cardWidth / CARD_WIDTH;

  const selected = INTERESTS.find((i) => i.id === selectedId);
  const isOtherSelected = selected?.id === OTHER_INTEREST_ID;
  const normalizedCustomInterest = customInterest.trim();
  const resolvedInterest = isOtherSelected
    ? normalizedCustomInterest
    : selected?.label;
  const canSubmit = Boolean(resolvedInterest);

  const handleSelect = (item: Interest) => {
    // 「その他」は自由入力が本体なので、カードを押したら入力モーダルを開く
    if (item.id === OTHER_INTEREST_ID) {
      setCustomOpen(true);
      return;
    }
    setSelectedId(item.id);
  };

  const handleSubmit = () => {
    if (!selected || !resolvedInterest) return;
    // 悩みランキング集計は興味カテゴリの安定キーで行う（AI生成worryはidが毎回変わるため）
    incrementThemeStat(selected.id, selected.label, selected.label);
    // 下流（候補・悩み・モチベ・開票）がリセットされ、worries画面の生成が発火する
    // 「その他」は自由入力を興味関心として渡し、その内容をAIの生成条件にする
    setInterest(resolvedInterest, showProfileStep);
    router.push("/election/worries");
  };

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="お悩み選択" />

      <ScrollView contentContainerClassName="pb-12">
        <View className="bg-white pb-3">
          <ElectionFlowStepper
            current={1}
            showProfileStep={showProfileStep}
          />
          <Text className="mt-3 text-center font-flow text-[18px] leading-[27px] text-flow-ink">
            {"興味・関心のあることを\n１つ教えてください！"}
          </Text>
        </View>

        <View
          className="mt-5 flex-row flex-wrap"
          style={{ paddingHorizontal: GRID_PADDING, gap: GRID_GAP }}
        >
          {INTERESTS.map((item) => (
            <InterestCard
              key={item.id}
              item={item}
              // 「その他」を確定済みのときは入力内容をカードに出す
              label={
                item.id === OTHER_INTEREST_ID && normalizedCustomInterest
                  ? normalizedCustomInterest
                  : item.shortLabel
              }
              selected={item.id === selectedId}
              scale={scale}
              onPress={() => handleSelect(item)}
            />
          ))}
        </View>

        <View className="mt-6 px-5">
          <FlowButton
            label="次へ進む"
            size="sm"
            disabled={!canSubmit}
            disabledFillColor="#d0d7de"
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>

      <CustomInterestModal
        visible={customOpen}
        value={customInterest}
        onClose={() => setCustomOpen(false)}
        onConfirm={(value) => {
          setCustomInterest(value);
          setSelectedId(OTHER_INTEREST_ID);
          setCustomOpen(false);
        }}
      />
    </View>
  );
}
