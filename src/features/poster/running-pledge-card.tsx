import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

const runningIcon = require("../../../assets/poster/icon-running.svg");
const doneIcon = require("../../../assets/poster/icon-done.svg");
const failedIcon = require("../../../assets/poster/icon-failed.svg");

/** Figma 2703:24270 のカード枠線・区切り色 */
const BORDER = "#f6f6f6";
const DIVIDER = "#eaeef2";
/** Figma: 策定日の淡いグレー / 期日のグレー / 期日超過の赤 */
const CREATED_INK = "#8c959f";
const DATE_INK = "#999999";
const OVERDUE_INK = "#ff2626";
/** Figma gray/800。「できた！」の塗りと「できなかった」の枠・文字 */
const DARK = "#32383f";
const CARD_SHADOW = "0px 1px 1.5px rgba(0,0,0,0.08)";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(value: number | undefined) {
  if (value === undefined) return null;
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}/${month}/${day}`;
}

/** 期日を何日過ぎたか。未到来なら null。日付境界で数えるので時刻は切り捨てる */
function overdueDays(deadline: number | undefined) {
  if (deadline === undefined) return null;
  const startOfDay = (value: number) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };
  const days = Math.floor((startOfDay(Date.now()) - startOfDay(deadline)) / DAY_MS);
  return days > 0 ? days : null;
}

type ActionButtonProps = {
  icon: number;
  label: string;
  /** true = 濃紺塗りに白文字（できた！） / false = 白地に濃紺の枠（できなかった） */
  filled: boolean;
  onPress: () => void;
};

/** Figma 2703:24289 / 2703:24293。アイコン上・ラベル下の縦積み */
function ActionButton({ icon, label, filled, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-1 items-center justify-center gap-[4px] rounded-[12px] py-[20px] active:opacity-80"
      style={{
        backgroundColor: filled ? DARK : "#ffffff",
        borderWidth: 1,
        borderColor: filled ? BORDER : DARK,
        boxShadow: CARD_SHADOW,
      }}
    >
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
          tintColor: filled ? "#ffffff" : DARK,
        }}
        contentFit="contain"
      />
      <Text
        className="font-flow text-[14px]"
        style={{ color: filled ? "#ffffff" : DARK }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type Props = {
  wish: Wish;
  onDone: () => void;
  onFailed: () => void;
};

/** 実行中の政策カード（Figma 2703:24270 Running-Pledge-Card） */
export function RunningPledgeCard({ wish, onDone, onFailed }: Props) {
  const createdAt = formatDate(wish.createdAt);
  const deadline = formatDate(wish.deadline);
  const overdue = overdueDays(wish.deadline);

  return (
    <View
      className="gap-[12px] rounded-[16px] bg-white px-[20px] pb-[20px] pt-[16px]"
      style={{ borderWidth: 1, borderColor: BORDER }}
    >
      <View
        className="gap-[4px] pb-[16px]"
        style={{ borderBottomWidth: 1, borderBottomColor: DIVIDER }}
      >
        <View className="flex-row items-center gap-[4px]">
          <Image
            source={runningIcon}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
          />
          <Text className="font-flow text-[12px] text-flow-pink">
            実行中の政策
          </Text>
        </View>

        <View className="gap-[8px]">
          <Text className="font-flow text-[20px] leading-normal text-flow-ink">
            {wish.policy?.trim() || wish.text}
          </Text>
          {/* Figma 2703:24283 Date-Info。策定日と期日は横並び */}
          <View className="flex-row flex-wrap items-start gap-x-[16px] gap-y-[2px]">
            {createdAt ? (
              <Text
                className="font-flow-regular text-[12px]"
                style={{ color: CREATED_INK }}
              >
                策定日：{createdAt}
              </Text>
            ) : null}
            {deadline ? (
              <Text
                className="font-flow-regular text-[12px]"
                style={{ color: DATE_INK }}
              >
                期日：{deadline}
                {overdue !== null ? (
                  <Text
                    className="font-flow text-[12px]"
                    style={{ color: OVERDUE_INK }}
                  >
                    {" "}
                    {overdue}日経過
                  </Text>
                ) : null}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-[8px]">
        <Text className="text-center font-flow text-[12px] leading-[20px] tracking-[0.6px] text-flow-ink">
          結果をタップして記録しよう！
        </Text>
        <View className="flex-row gap-[12px]">
          <ActionButton icon={doneIcon} label="できた！" filled onPress={onDone} />
          <ActionButton
            icon={failedIcon}
            label="できなかった"
            filled={false}
            onPress={onFailed}
          />
        </View>
      </View>
    </View>
  );
}
