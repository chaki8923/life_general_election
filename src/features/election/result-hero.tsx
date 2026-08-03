import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Image } from "@/tw/image";
import { Text, View } from "@/tw";

const crowdImage = require("../../../assets/election/top-crowd.png");
const characterImage = require("../../../assets/poster/default-character.png");

const INFO_PAGES = [
  {
    title: "公約、政策とは？",
    body: "人生公約は、あなたが掲げる大きな目標のこと。掲げる政策は、そこに近づくための具体的な一歩です。",
  },
  {
    title: "どう選べばいい？",
    body: "1000人の投票結果を参考に、いまの自分に合いそうな公約と政策を選んでください。あとから変更もできます。",
  },
] as const;

type ResultHeroProps = {
  themeLabel: string;
};

export function ResultHero({ themeLabel }: ResultHeroProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const cardWidth = width - 40;

  return (
    <View className="mt-4">
      <Text className="text-center font-flow text-[22px] leading-8 text-flow-ink">
        みんなの声が集まりました！
      </Text>
      <Text className="mt-2 text-center font-flow-medium text-xs leading-5 text-flow-ink-mid">
        1000人の投票をもとに、{"\n"}
        あなたに近い一歩を提案します
      </Text>
      <Text className="mt-1 text-center font-flow-medium text-[10px] text-flow-ink-low">
        {themeLabel}
      </Text>

      <Image
        source={crowdImage}
        className="mt-4 self-center"
        style={{ width: 275, height: 120 }}
        contentFit="contain"
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / cardWidth))
        }
        className="mt-4"
        style={{ width: cardWidth }}
      >
        {INFO_PAGES.map((info) => (
          <View
            key={info.title}
            style={{ width: cardWidth }}
            className="rounded-2xl border border-flow-pink/40 bg-[#fff5f7] px-4 py-3"
          >
            <View className="flex-row items-start gap-3">
              <Image
                source={characterImage}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
              <View className="flex-1">
                <Text className="font-flow text-sm text-flow-pink">
                  {info.title}
                </Text>
                <Text className="mt-1 font-flow-medium text-[11px] leading-4 text-flow-ink-mid">
                  {info.body}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="mt-2 flex-row items-center justify-between px-1">
        <View className="flex-row gap-1.5">
          {INFO_PAGES.map((info, i) => (
            <View
              key={info.title}
              className={`h-1.5 rounded-full ${
                i === page ? "w-3 bg-flow-pink" : "w-1.5 bg-flow-ink-low/40"
              }`}
            />
          ))}
        </View>
        <Text className="font-flow-medium text-[10px] text-flow-ink-low">
          {page + 1}/{INFO_PAGES.length}
        </Text>
      </View>
    </View>
  );
}
