import { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { ElectionFlowStepper } from "@/features/election/election-flow-stepper";
import { ELECTION_MOTIVATIONS } from "@/constants/election-motivations";
import { useDesignScale } from "@/features/election/layout";
import { MotivationSlider } from "@/features/election/motivation-slider";
import { useElectionStore } from "@/stores/election";

/** 以下すべてCONTENT_TOP（ステッパー下端）を原点にしたアートボード座標 */
const HEADING_TOP = 97.706;
const HEADING_LEFT = 34;
const HEADING_WIDTH = 322;
const HEADING_GAP = 8;

const SLIDER_BUTTON_TOP = 406.706;

const CONFIRM_TOP = 52.706;
const CONFIRM_WIDTH = 322;
const CONFIRM_GAP = 43;
/** 炎は少し重ねて並べる（Figma: mr -13px） */
const FLAME_WIDTH = 97;
const FLAME_HEIGHT = 78;
const FLAME_OVERLAP = 13;

type Phase = "input" | "confirm";

export default function MotivationSelectScreen() {
  const router = useRouter();
  const { s } = useDesignScale();
  const interest = useElectionStore((state) => state.interest);
  const worry = useElectionStore((state) => state.worry);
  const setMotivation = useElectionStore((state) => state.setMotivation);
  const [phase, setPhase] = useState<Phase>("input");
  // スライダーは左が弱いので、high→medium→smallの定数配列とは逆順に引く
  const [level, setLevel] = useState(1);

  // 直リンク等で上流状態がない場合は興味関心の選択からやり直し
  if (!worry) {
    return (
      <View className="flex-1 items-center justify-center bg-flow-bg px-8">
        <Text className="font-flow text-base text-flow-ink">
          悩みが選ばれていません
        </Text>
        <FlowButton
          label="興味・関心を選ぶ"
          onPress={() => router.replace("/election")}
          className="mt-4"
        />
      </View>
    );
  }

  const motivation =
    ELECTION_MOTIVATIONS[ELECTION_MOTIVATIONS.length - 1 - level] ??
    ELECTION_MOTIVATIONS[1];

  const handleStart = () => {
    // electionがリセットされ、counting画面で開票が生成される
    setMotivation(motivation.label);
    router.push("/election/counting");
  };

  if (phase === "confirm") {
    return (
      <View className="flex-1 bg-flow-bg">
        <FlowHeader title="モチベーション" onBack={() => setPhase("input")} />
        {/* 会場背景はヘッダーのすぐ下から全面に敷き、ステッパーはその上に重ねる */}
        <View className="flex-1 overflow-hidden">
          <Image
            source={require("../../../assets/election/arena-confirm.png")}
            className="absolute inset-0"
            contentFit="cover"
            pointerEvents="none"
          />
          <ElectionFlowStepper current={1} className="mt-3" />

          <View className="flex-1">
          <View
            style={{
              position: "absolute",
              left: s((390 - CONFIRM_WIDTH) / 2),
              top: s(CONFIRM_TOP),
              width: s(CONFIRM_WIDTH),
              gap: s(CONFIRM_GAP),
            }}
          >
            <View style={{ gap: s(33) }}>
              <Text
                className="text-center font-flow text-flow-onDark"
                style={{
                  fontSize: s(28),
                  lineHeight: s(44),
                  letterSpacing: s(1.4),
                }}
              >
                投票を開始します
              </Text>

              <View
                className="items-center rounded-lg bg-white shadow-md shadow-black/10"
                style={{
                  paddingTop: s(20),
                  paddingBottom: s(32),
                  paddingHorizontal: s(16),
                  gap: s(16),
                }}
              >
                <View className="items-center" style={{ gap: s(6) }}>
                  <Text
                    className="text-center font-flow text-flow-pink"
                    style={{ fontSize: s(14), lineHeight: s(24) }}
                  >
                    お題
                  </Text>
                  <Text
                    className="text-center font-flow text-black"
                    style={{ fontSize: s(28), lineHeight: s(44) }}
                  >
                    『{interest ?? worry.category}』
                  </Text>
                </View>

                <View className="w-full items-center" style={{ gap: s(6) }}>
                  <Text
                    className="text-center font-flow text-flow-pink"
                    style={{ fontSize: s(14), lineHeight: s(24) }}
                  >
                    悩み
                  </Text>
                  <Text
                    className="text-center font-flow text-black"
                    style={{ fontSize: s(24), lineHeight: s(36) }}
                  >
                    {worry.text}
                  </Text>
                </View>

                <View className="w-full items-center" style={{ gap: s(6) }}>
                  <Text
                    className="text-center font-flow text-flow-pink"
                    style={{ fontSize: s(14), lineHeight: s(24) }}
                  >
                    モチベーション
                  </Text>
                  <View className="flex-row items-center">
                    {Array.from({ length: level + 1 }, (_, i) => (
                      <Image
                        key={i}
                        source={require("../../../assets/election/fire.webp")}
                        style={{
                          width: s(FLAME_WIDTH),
                          height: s(FLAME_HEIGHT),
                          marginRight: i === level ? 0 : s(-FLAME_OVERLAP),
                        }}
                        contentFit="contain"
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <FlowButton label="OK" variant="pink" onPress={handleStart} />
          </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader title="モチベーション" />
      <ElectionFlowStepper current={1} className="mt-3" />

      {/* Figma 1700:6638。見出しの下でそのまま炎を動かして選ぶ */}
      <View className="flex-1 overflow-hidden">
        <View
          style={{
            position: "absolute",
            left: s(HEADING_LEFT),
            top: s(HEADING_TOP),
            width: s(HEADING_WIDTH),
            gap: s(HEADING_GAP),
          }}
        >
          <Text
            className="text-center font-flow text-flow-ink"
            style={{
              fontSize: s(12),
              lineHeight: s(20),
              letterSpacing: s(0.6),
            }}
          >
            いいですね〜
          </Text>
          <Text
            className="text-center font-flow text-flow-ink"
            style={{
              fontSize: s(28),
              lineHeight: s(44),
              letterSpacing: s(1.4),
            }}
          >
            その悩みに対する{"\n"}モチベーションは？
          </Text>
        </View>

        <MotivationSlider level={level} onChange={setLevel} />

        <View
          style={{
            position: "absolute",
            left: s(34),
            top: s(SLIDER_BUTTON_TOP),
            width: s(322),
          }}
        >
          <FlowButton label="次へ" onPress={() => setPhase("confirm")} />
        </View>
      </View>
    </View>
  );
}
