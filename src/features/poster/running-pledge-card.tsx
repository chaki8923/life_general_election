import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { Wish } from "@/types";

const runningIcon = require("../../../assets/poster/icon-running.svg");
const doneIcon = require("../../../assets/poster/icon-done.svg");
const failedIcon = require("../../../assets/poster/icon-failed.svg");

/** Figma 2040:6133 のカード枠線・区切り色 */
const BORDER = "#f6f6f6";
/** Figma: 日付の淡いグレー / 期日超過の赤 */
const DATE_INK = "#999999";
const OVERDUE_INK = "#ff2626";

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
  onPress: () => void;
};

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[69px] flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-white active:opacity-80"
      style={{
        borderWidth: 1,
        borderColor: BORDER,
        boxShadow: "0px 1px 1.5px rgba(0,0,0,0.08)",
      }}
    >
      <Image
        source={icon}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
      <Text className="font-flow text-sm text-flow-ink">{label}</Text>
    </Pressable>
  );
}

type Props = {
  wish: Wish;
  onDone: () => void;
  onFailed: () => void;
};

/** 実行中の政策カード（Figma 2040:6133 Running-Pledge-Card） */
export function RunningPledgeCard({ wish, onDone, onFailed }: Props) {
  const createdAt = formatDate(wish.createdAt);
  const deadline = formatDate(wish.deadline);
  const overdue = overdueDays(wish.deadline);

  return (
    <View
      className="gap-4 rounded-[20px] bg-white p-5"
      style={{ borderWidth: 1, borderColor: BORDER }}
    >
      <View className="gap-1">
        <View className="flex-row items-center gap-1">
          <Image
            source={runningIcon}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
          />
          <Text className="font-flow text-xs text-flow-pink">実行中の政策</Text>
        </View>

        <View className="gap-2">
          <Text className="font-flow text-xl leading-normal text-flow-ink">
            {wish.policy?.trim() || wish.text}
          </Text>
          <View className="gap-1">
            {createdAt ? (
              <Text
                className="font-flow-medium text-xs"
                style={{ color: DATE_INK }}
              >
                策定日：{createdAt}
              </Text>
            ) : null}
            {deadline ? (
              <Text
                className="font-flow-medium text-xs"
                style={{ color: DATE_INK }}
              >
                期日：{deadline}
                {overdue !== null ? (
                  <Text
                    className="font-flow text-xs"
                    style={{ color: OVERDUE_INK }}
                  >
                    {"  "}
                    {overdue}日経過
                  </Text>
                ) : null}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <ActionButton icon={doneIcon} label="できた！" onPress={onDone} />
        <ActionButton
          icon={failedIcon}
          label="できなかった"
          onPress={onFailed}
        />
      </View>
    </View>
  );
}
