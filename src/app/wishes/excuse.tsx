import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import {
  FlowTabBarOverlay,
  useTabBarBottomPadding,
} from "@/components/ui/tab-bar";
import {
  generateExcuse,
  generateExcuseReasons,
} from "@/features/excuse/generate";
import { mirrorWish } from "@/services/firebase/mirror";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";

/** Figma 2665:17353。未選択の枠と選択時のピンク */
const OPTION_BORDER = "#d0d7de";
const OPTION_BORDER_SELECTED = "#f4728a";
const OPTION_INK = "#24292f";
const OPTION_INK_SELECTED = "#f4728a";
/** Figma 2508:8928。無効な「次へ」は gray/200 */
const BUTTON_DISABLED = "#d0d7de";
/** モックが即返っても候補が一瞬で入れ替わらないよう、最低限の待ち時間を設ける */
const MIN_LOADING_MS = 1200;

type OptionProps = {
  index: number;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** 番号バッジ付きの理由カード（Figma 2665:17353 Option_1） */
function ReasonOption({ index, label, selected, onPress }: OptionProps) {
  const ink = selected ? OPTION_INK_SELECTED : OPTION_INK;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className="w-full flex-row items-center gap-[12px] rounded-[16px] bg-white p-[20px] active:opacity-80"
      style={{
        borderWidth: 1.5,
        borderColor: selected ? OPTION_BORDER_SELECTED : OPTION_BORDER,
      }}
    >
      <View className="h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-white">
        <Text className="font-flow text-[14px]" style={{ color: ink }}>
          {index + 1}
        </Text>
      </View>
      <Text
        className="flex-1 font-flow text-[16px] leading-[24px] tracking-[0.8px]"
        style={{ color: ink }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * できなかった理由を選ぶ画面（Figma 2665:17339「言い訳を考えよう」）。
 * 選んだ理由をもとに言い訳を生成し、excused として記録してから完了画面へ送る。
 */
export default function WishExcuseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const wish = useWishStore((state) =>
    state.wishes.find((item) => item.id === id)
  );
  const markExcused = useWishStore((state) => state.markExcused);
  const bottomPadding = useTabBarBottomPadding();
  const [reasons, setReasons] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!wish) return;
    let alive = true;
    Promise.all([
      generateExcuseReasons({ wish }),
      new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
    ]).then(([generated]) => {
      if (alive) setReasons(generated);
    });
    return () => {
      alive = false;
    };
    // 候補は画面に入った時点の公約に対して1度だけ引く
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wish?.id]);

  // 直リンクや削除済みの公約で開かれたときの救済（election/motivation.tsx と同じ流儀）
  if (!wish) {
    return (
      <View className="flex-1 bg-flow-bg">
        <FlowHeader title="言い訳を考えよう" />
        <View className="flex-1 items-center justify-center gap-[24px] px-[20px]">
          <Text className="text-center font-flow-medium text-sm leading-6 text-flow-ink-low">
            対象の公約が見つかりませんでした
          </Text>
          <FlowButton
            label="マイページへ戻る"
            className="h-[48px] w-full"
            onPress={() => router.replace("/")}
          />
        </View>
      </View>
    );
  }

  const handleNext = async () => {
    if (selected === null || !reasons || submitting) return;
    setSubmitting(true);
    const excuse = await generateExcuse({ wish, reason: reasons[selected] });
    const updated = markExcused(wish.id, excuse);
    if (updated) mirrorWish(updated);
    router.replace({
      pathname: "/wishes/excuse-complete",
      params: { id: wish.id },
    });
  };

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="言い訳を考えよう" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: bottomPadding,
        }}
      >
        {/* Figma 2665:17346。見出し群と選択肢の間は32、ボタンとは40 */}
        <View className="gap-[32px] px-[20px]">
          <View className="gap-[8px]">
            <Text className="text-center font-flow text-[18px] leading-[28px] tracking-[0.9px] text-flow-ink">
              できなかった理由に{"\n"}一番近いものを選んでね
            </Text>
            <Text className="text-center font-flow-regular text-[14px] leading-[24px] tracking-[0.7px] text-flow-ink-low">
              とぴょっこが言い訳を考えてくれます
            </Text>
          </View>

          {reasons === null ? (
            <View className="items-center gap-[12px] py-[48px]">
              <ActivityIndicator color="#6e7781" />
              <Text className="font-flow-medium text-sm text-flow-ink-low">
                理由の候補を考えています…
              </Text>
            </View>
          ) : (
            <View className="gap-[16px]">
              {reasons.map((reason, index) => (
                <ReasonOption
                  // AIとモックが混ざると文言が重複しうるので、位置をキーにする
                  key={index}
                  index={index}
                  label={reason}
                  selected={selected === index}
                  onPress={() => setSelected(index)}
                />
              ))}
            </View>
          )}
        </View>

        <View className="mt-[40px] px-[20px]">
          <FlowButton
            label="次へ"
            className="h-[48px]"
            disabled={selected === null}
            disabledFillColor={BUTTON_DISABLED}
            loading={submitting}
            onPress={handleNext}
          />
        </View>
      </ScrollView>

      <FlowTabBarOverlay
        active="index"
        onPress={(tab) => {
          if (tab === "index") router.replace("/");
          else if (tab === "vote") router.replace("/(tabs)/vote");
          else router.replace("/(tabs)/achievements");
        }}
      />
    </View>
  );
}
