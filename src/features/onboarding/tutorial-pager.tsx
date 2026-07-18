import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "@/tw";
import { useProfileStore } from "@/stores/profile";
import { TUTORIAL_PAGES } from "./tutorial-pages";

/** 横スワイプ式のチュートリアル。完了/スキップでプロフィール登録へ進む */
export function TutorialPager() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const markTutorialSeen = useProfileStore((s) => s.markTutorialSeen);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const isLast = page === TUTORIAL_PAGES.length - 1;

  const finish = () => {
    markTutorialSeen();
    router.replace("/onboarding/profile");
  };

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  return (
    <View className="flex-1 bg-election-cream">
      <View className="items-end px-6 pt-16">
        <Pressable onPress={finish} hitSlop={12}>
          <Text className="text-sm font-bold text-election-ink/40">
            スキップ
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        style={{ flex: 1 }}
      >
        {TUTORIAL_PAGES.map((p) => (
          <View
            key={p.title}
            // 動的な画面幅はclassNameで書けないためstyleで指定
            style={{ width }}
            className="items-center justify-center px-10"
          >
            <Text className="text-7xl">{p.emoji}</Text>
            <Text className="mt-8 text-center text-3xl font-bold text-election-ink">
              {p.title}
            </Text>
            <Text className="mt-4 text-center text-base leading-6 text-election-ink/60">
              {p.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-10">
        <View className="mb-6 flex-row justify-center gap-2">
          {TUTORIAL_PAGES.map((p, i) => (
            <View
              key={p.title}
              className={`h-2 w-2 rounded-full ${
                i === page ? "bg-election-red" : "bg-election-ink/20"
              }`}
            />
          ))}
        </View>
        <Pressable
          onPress={handleNext}
          className="items-center rounded-full border-2 border-election-gold bg-election-red py-4 shadow-lg shadow-election-red/50 active:bg-election-red-dark"
        >
          <Text className="text-lg font-bold tracking-wide text-white">
            {isLast ? "🗳️ はじめる" : "次へ"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
