import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useElectionStore } from "@/stores/election";
import { Image } from "@/tw/image";
import { ScrollView, View } from "@/tw";

/** 添付スクショを Figma「開票結果-公約」(704:9787) の上から順に並べたもの */
const imgs = {
  header: require("../../../assets/election/result/mock/01-header.png"),
  stepper: require("../../../assets/election/result/mock/02-stepper.png"),
  hero: require("../../../assets/election/result/mock/03-hero.png"),
  tip: require("../../../assets/election/result/mock/04-tip.png"),
  rank1: require("../../../assets/election/result/mock/05-rank.png"),
  policy1: require("../../../assets/election/result/mock/06-policy.png"),
  rank2: require("../../../assets/election/result/mock/07-rank-2.png"),
  policy2: require("../../../assets/election/result/mock/09-policy-2.png"),
  rank3: require("../../../assets/election/result/mock/10-rank-3.png"),
  policy3: require("../../../assets/election/result/mock/12-policy-3.png"),
  uniqueVoices: require("../../../assets/election/result/mock/14-unique-voices.png"),
  char1: require("../../../assets/election/result/mock/13-char-1.png"),
  char2: require("../../../assets/election/result/mock/08-char-2.png"),
  char3: require("../../../assets/election/result/mock/11-char-3.png"),
  minorityRow: require("../../../assets/election/result/mock/15-minority-row.png"),
  minorityPolicy: require("../../../assets/election/result/mock/16-policy-minority.png"),
  dots: require("../../../assets/election/result/mock/17-dots.png"),
  tabbar: require("../../../assets/election/result/mock/18-tabbar.png"),
} as const;

function FullBleed({
  source,
  aspectRatio,
}: {
  source: number;
  aspectRatio: number;
}) {
  return (
    <Image
      source={source}
      className="w-full"
      style={{ aspectRatio }}
      contentFit="fill"
    />
  );
}

function ContentImage({
  source,
  aspectRatio,
}: {
  source: number;
  aspectRatio: number;
}) {
  return (
    <Image
      source={source}
      className="w-full"
      style={{ aspectRatio }}
      contentFit="contain"
    />
  );
}

export default function ElectionResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const worry = useElectionStore((s) => s.worry);
  const motivation = useElectionStore((s) => s.motivation);
  const election = useElectionStore((s) => s.election);
  const hasSource = Boolean(worry && motivation);

  // 開票の生成は counting が担う。未開票なら投票中へ戻す。
  useEffect(() => {
    if (hasSource && !election) router.replace("/election/counting");
  }, [hasSource, election, router]);

  if (hasSource && !election) return null;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー → ステッパー → ヒーロー */}
        <FullBleed source={imgs.header} aspectRatio={390 / 42} />
        <FullBleed source={imgs.stepper} aspectRatio={390 / 42} />
        <FullBleed source={imgs.hero} aspectRatio={390 / 166} />

        {/* Figma: 左右20 / 幅350 の本文列 */}
        <View className="mt-4 gap-5 px-5">
          <ContentImage source={imgs.tip} aspectRatio={350 / 119} />

          {/* 1位カード断片 */}
          <View className="gap-3">
            <ContentImage source={imgs.rank1} aspectRatio={326 / 50} />
            <ContentImage source={imgs.policy1} aspectRatio={326 / 185} />
          </View>

          {/* 2位カード断片 */}
          <View className="gap-3">
            <ContentImage source={imgs.rank2} aspectRatio={326 / 50} />
            <ContentImage source={imgs.policy2} aspectRatio={326 / 185} />
          </View>

          {/* 3位カード断片 */}
          <View className="gap-3">
            <ContentImage source={imgs.rank3} aspectRatio={326 / 50} />
            <ContentImage source={imgs.policy3} aspectRatio={326 / 185} />
          </View>

          {/* そのほかにもユニークな声が集まったよ！ */}
          <ContentImage source={imgs.uniqueVoices} aspectRatio={296 / 16} />

          {/* Figma 1905:13963 — キャラ3体を横並び */}
          <View className="h-[132px] flex-row items-end justify-center gap-2">
            <Image
              source={imgs.char1}
              style={{ width: 80, height: 123 }}
              contentFit="contain"
            />
            <Image
              source={imgs.char2}
              style={{ width: 90, height: 132 }}
              contentFit="contain"
            />
            <Image
              source={imgs.char3}
              style={{ width: 76, height: 127 }}
              contentFit="contain"
            />
          </View>

          {/* マイノリティ声（横カルーセル相当を縦に仮置き） */}
          <View className="gap-3">
            <ContentImage source={imgs.minorityRow} aspectRatio={326 / 50} />
            <ContentImage
              source={imgs.minorityPolicy}
              aspectRatio={326 / 172}
            />
          </View>
        </View>

        {/* ページドット → BottomNav */}
        <View className="mt-4 gap-3">
          <FullBleed source={imgs.dots} aspectRatio={390 / 24} />
          <View className="items-center px-5">
            <Image
              source={imgs.tabbar}
              style={{ width: "100%", aspectRatio: 366 / 80 }}
              contentFit="contain"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
