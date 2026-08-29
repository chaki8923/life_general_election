import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView as RNScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlowButton } from "@/components/ui/flow-button";
import {
  formatBirthDate,
  toBirthDateString,
} from "@/features/onboarding/age-range";
import { Pressable, Text, View } from "@/tw";

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
/** 先頭/末尾の値も中央の選択枠に載せるための余白 */
const PAD = ((VISIBLE_ROWS - 1) / 2) * ROW_HEIGHT;

const BORDER_EMPTY = "#afb8c1";
const BORDER_FILLED = "#f4728a";

/** 「その月の日数」。new Date(y, m, 0) は m月の最終日になる */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

type Draft = { year: number; month: number; day: number };

function parseBirthDate(value: string | null): Draft | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

type WheelColumnProps = {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  suffix: string;
};

function WheelColumn({ values, value, onChange, suffix }: WheelColumnProps) {
  const ref = useRef<RNScrollView>(null);
  const offsetRef = useRef(0);
  const index = Math.max(0, values.indexOf(value));

  const scrollToIndex = (i: number, animated: boolean) => {
    const y = i * ROW_HEIGHT;
    offsetRef.current = y;
    ref.current?.scrollTo({ y, animated });
  };

  // 月末クランプなど「外から値が飛んだ」ときだけ補正する。
  // ユーザーのスクロール由来の変更では既にほぼ目標位置にいるので割り込まない
  useEffect(() => {
    const target = index * ROW_HEIGHT;
    if (Math.abs(offsetRef.current - target) > ROW_HEIGHT / 2) {
      scrollToIndex(index, false);
    }
  }, [index]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    offsetRef.current = y;
    const i = Math.min(
      Math.max(Math.round(y / ROW_HEIGHT), 0),
      values.length - 1
    );
    if (values[i] !== value) onChange(values[i]);
  };

  return (
    <RNScrollView
      ref={ref}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: PAD }}
      // ゆっくり離すと慣性が出ずonMomentumScrollEndが来ないので、ドラッグ終了でも確定する
      onMomentumScrollEnd={settle}
      onScrollEndDrag={settle}
      onLayout={() => scrollToIndex(index, false)}
      style={{ flex: 1, height: ROW_HEIGHT * VISIBLE_ROWS }}
    >
      {values.map((v) => (
        <View
          key={v}
          style={{ height: ROW_HEIGHT }}
          className="items-center justify-center"
        >
          <Text
            className={`font-flow text-[16px] ${
              v === value ? "text-flow-ink" : "text-flow-ink-low"
            }`}
          >
            {v}
            {suffix}
          </Text>
        </View>
      ))}
    </RNScrollView>
  );
}

type BirthDateWheelModalProps = {
  visible: boolean;
  value: string | null;
  onCancel: () => void;
  onConfirm: (birthDate: string) => void;
};

/** 年/月/日の3カラムホイール。ネイティブの日付ピッカーは端末差が大きいので自前で描く */
export function BirthDateWheelModal({
  visible,
  value,
  onCancel,
  onConfirm,
}: BirthDateWheelModalProps) {
  const insets = useSafeAreaInsets();
  const thisYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 91 }, (_, i) => thisYear - 100 + i),
    [thisYear]
  );
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const fallback: Draft = { year: thisYear - 25, month: 1, day: 1 };
  const [draft, setDraft] = useState<Draft>(
    () => parseBirthDate(value) ?? fallback
  );

  // 開き直したら現在値に戻す（キャンセルした編集を持ち越さない）
  useEffect(() => {
    if (visible) setDraft(parseBirthDate(value) ?? fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, value]);

  const maxDay = daysInMonth(draft.year, draft.month);
  // 31日を選んでから2月へ動かしても「31を選んだ意図」はdraftに残し、表示だけクランプする
  const day = Math.min(draft.day, maxDay);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => i + 1),
    [maxDay]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
        />
        <View
          className="rounded-t-[20px] bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="h-1 w-[101px] self-center rounded-full bg-[#d9d9d9]" />
          <Text className="mt-4 text-center font-flow text-[16px] text-flow-ink">
            生年月日
          </Text>

          <View
            className="mt-4 flex-row"
            style={{ height: ROW_HEIGHT * VISIBLE_ROWS }}
          >
            {/* 中央の選択枠。ホイールより手前に置くとスクロールを奪うのでpointerEventsを切る */}
            <View
              pointerEvents="none"
              className="absolute inset-x-0 border-y border-[#e5e5e5]"
              style={{ top: PAD, height: ROW_HEIGHT }}
            />
            <WheelColumn
              values={years}
              value={draft.year}
              onChange={(year) => setDraft((d) => ({ ...d, year }))}
              suffix="年"
            />
            <WheelColumn
              values={months}
              value={draft.month}
              onChange={(month) => setDraft((d) => ({ ...d, month }))}
              suffix="月"
            />
            <WheelColumn
              values={days}
              value={day}
              onChange={(d) => setDraft((prev) => ({ ...prev, day: d }))}
              suffix="日"
            />
          </View>

          <FlowButton
            label="決定"
            onPress={() =>
              onConfirm(toBirthDateString(draft.year, draft.month, day))
            }
            className="mt-4 w-full"
          />
        </View>
      </View>
    </Modal>
  );
}

type BirthDateFieldProps = {
  value: string | null;
  onChange: (birthDate: string) => void;
};

/** Figma: h36 / r8 / 未入力は枠グレー・入力済みはピンク */
export function BirthDateField({ value, onChange }: BirthDateFieldProps) {
  const [open, setOpen] = useState(false);
  const filled = Boolean(value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `生年月日 ${formatBirthDate(value)}` : "生年月日を選択"
        }
        className="h-[36px] flex-row items-center justify-between rounded-[8px] border bg-white px-4"
        style={{ borderColor: filled ? BORDER_FILLED : BORDER_EMPTY }}
      >
        <Text
          className={`font-flow text-[14px] ${
            filled ? "text-[#1f1f1f]" : "text-flow-ink-low"
          }`}
        >
          {value ? formatBirthDate(value) : "選択してください"}
        </Text>
        {/* 下向きシェブロン。正方形の2辺を45度回して作る（SVG非依存） */}
        <View
          className="h-[7px] w-[7px] border-b-[1.5px] border-r-[1.5px] border-[#6e7781]"
          style={{ transform: [{ rotate: "45deg" }], marginTop: -4 }}
        />
      </Pressable>

      <BirthDateWheelModal
        visible={open}
        value={value}
        onCancel={() => setOpen(false)}
        onConfirm={(birthDate) => {
          onChange(birthDate);
          setOpen(false);
        }}
      />
    </>
  );
}
