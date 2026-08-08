import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FlowHeader } from "@/components/ui/flow-header";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import {
  getPosterLevelProgress,
  POSTER_LEVEL_META,
} from "@/features/poster/level";
import { PosterCanvas } from "@/features/poster/poster-canvas";
import { resolvePosterSettings } from "@/features/poster/poster-settings";
import { getPosterPalette } from "@/features/poster/templates";
import {
  ReportModal,
  type ReportAction,
} from "@/features/wishes/report-modal";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { Wish } from "@/types";

const PAGE_HORIZONTAL_PADDING = 20;

export default function MyPageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<FlatList<Wish>>(null);
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);
  const nickname = useProfileStore((state) => state.profile?.nickname ?? "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reportAction, setReportAction] = useState<ReportAction | null>(null);
  const bottomPadding = useTabBarBottomPadding();

  const activeWishes = wishes.filter((wish) => wish.status === "active");
  const doneWishes = wishes.filter((wish) => wish.status === "done");
  const progress = getPosterLevelProgress(doneWishes.length);
  const levelMeta = POSTER_LEVEL_META[progress.level];
  const carouselWidth = Math.max(1, width - PAGE_HORIZONTAL_PADDING * 2);
  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, activeWishes.length - 1)
  );
  const currentWish = activeWishes[safeCurrentIndex] ?? null;

  useEffect(() => {
    if (currentIndex === safeCurrentIndex) return;
    setCurrentIndex(safeCurrentIndex);
    requestAnimationFrame(() => {
      carouselRef.current?.scrollToIndex({
        index: safeCurrentIndex,
        animated: false,
      });
    });
  }, [currentIndex, safeCurrentIndex]);

  useEffect(() => {
    if (activeWishes.length === 0) return;
    requestAnimationFrame(() => {
      carouselRef.current?.scrollToIndex({
        index: safeCurrentIndex,
        animated: false,
      });
    });
  }, [carouselWidth, safeCurrentIndex, activeWishes.length]);

  const handlePageChange = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const next = Math.round(
      event.nativeEvent.contentOffset.x / carouselWidth
    );
    setCurrentIndex(
      Math.max(0, Math.min(next, activeWishes.length - 1))
    );
  };

  const renderPoster = ({ item, index }: { item: Wish; index: number }) => {
    const settings = resolvePosterSettings(item, nickname);
    const palette = getPosterPalette(settings.paletteId);
    return (
      <View style={{ width: carouselWidth }} className="px-0.5">
        <View
          className="rounded-3xl bg-white p-4"
          style={{ boxShadow: "0 5px 18px rgba(0,0,0,0.08)" }}
        >
          <PosterCanvas
            settings={settings}
            slogan={item.text}
            palette={palette}
            level={progress.level}
            interactive={index === safeCurrentIndex}
          />
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/poster",
                params: { wishId: item.id },
              })
            }
            className="mt-4 h-12 items-center justify-center rounded-full bg-election-red"
          >
            <Text className="text-sm font-bold text-white">
              この公約のポスターを編集
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      <FlowHeader title="設定済みの公約・政策" hideBack />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: bottomPadding }}
      >
        <View className="px-5">
          {!hasHydrated ? (
            <View className="items-center py-20">
              <Text className="text-sm text-[#737373]">
                公約を読み込んでいます…
              </Text>
            </View>
          ) : wishes.length === 0 ? (
            <View className="mt-10 items-center rounded-2xl bg-white px-6 py-10">
              <Text className="text-lg font-bold text-[#333333]">
                まだ人生公約がありません
              </Text>
              <Text className="mt-3 text-center text-sm leading-6 text-[#737373]">
                総選挙を開いて、最初の小さな一歩を決めましょう
              </Text>
              <Pressable
                onPress={() => router.push("/election")}
                className="mt-6 h-12 items-center justify-center rounded-full bg-election-red px-8"
              >
                <Text className="text-base font-bold text-white">
                  総選挙をはじめる
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View
                className="mt-6 overflow-hidden rounded-3xl bg-election-navy p-5"
                style={{ boxShadow: "0 8px 24px rgba(26,39,68,0.22)" }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold tracking-[2px] text-election-gold">
                      POSTER RANK
                    </Text>
                    <Text className="mt-1 text-2xl font-black text-white">
                      {levelMeta.title}
                    </Text>
                    <Text className="mt-2 text-xs leading-5 text-white/65">
                      {levelMeta.description}
                    </Text>
                  </View>
                  <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-election-gold bg-white/10">
                    <Text className="text-[10px] font-bold text-election-gold">
                      LEVEL
                    </Text>
                    <Text className="text-2xl font-black text-white">
                      {progress.level}
                    </Text>
                  </View>
                </View>

                <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                  <View
                    className="h-full rounded-full bg-election-gold"
                    style={{ width: `${Math.max(4, progress.ratio * 100)}%` }}
                  />
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-[11px] font-bold text-white/60">
                    達成 {doneWishes.length}件
                  </Text>
                  <Text className="text-[11px] font-bold text-election-gold">
                    {progress.nextAt === null
                      ? "最高ランク到達"
                      : `あと${progress.remaining}件で次のレベル`}
                  </Text>
                </View>
              </View>

              {activeWishes.length > 0 ? (
                <>
                  <View className="mt-8 flex-row items-end justify-between">
                    <View>
                      <Text className="text-xs font-bold tracking-[2px] text-election-red">
                        MY POSTERS
                      </Text>
                      <Text className="mt-1 text-xl font-black text-[#333333]">
                        実行中の選挙ポスター
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-bold text-[#737373]"
                      style={{ fontVariant: ["tabular-nums"] }}
                    >
                      {safeCurrentIndex + 1} / {activeWishes.length}
                    </Text>
                  </View>
                  <Text className="mt-2 text-xs leading-5 text-[#737373]">
                    横にスライドして、公約ごとのポスターを確認できます。
                  </Text>
                </>
              ) : null}
            </>
          )}
        </View>

        {hasHydrated && wishes.length > 0 && activeWishes.length > 0 ? (
          <>
            <FlatList
              ref={carouselRef}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              contentInsetAdjustmentBehavior="automatic"
              showsHorizontalScrollIndicator={false}
              data={activeWishes}
              keyExtractor={(item) => item.id}
              renderItem={renderPoster}
              onMomentumScrollEnd={handlePageChange}
              getItemLayout={(_, index) => ({
                length: carouselWidth,
                offset: carouselWidth * index,
                index,
              })}
              style={{ width: carouselWidth, alignSelf: "center", marginTop: 16 }}
            />

            <View className="mt-3 items-center px-5">
              {activeWishes.length >= 2 && activeWishes.length <= 7 ? (
                <View className="flex-row justify-center gap-2">
                  {activeWishes.map((wish, index) => (
                    <View
                      key={wish.id}
                      className={`h-2 rounded-full ${
                        index === safeCurrentIndex
                          ? "w-5 bg-election-red"
                          : "w-2 bg-election-ink/20"
                      }`}
                    />
                  ))}
                </View>
              ) : null}

              <Text className="mt-8 self-start text-lg font-bold text-[#333333]">
                実行中の政策
              </Text>
              <View className="mt-3 w-full gap-3">
                <Pressable
                  onPress={() => setReportAction("done")}
                  className="h-12 items-center justify-center rounded-full bg-[#555555]"
                >
                  <Text className="text-base font-bold text-white">できた</Text>
                </Pressable>
                <Pressable
                  onPress={() => setReportAction("excuse")}
                  className="h-12 items-center justify-center rounded-full border-2 border-[#737373] bg-white"
                >
                  <Text className="text-base font-bold text-[#555555]">
                    言い訳を生成する
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        {hasHydrated && wishes.length > 0 ? (
          <View className="px-5">
            {activeWishes.length === 0 ? (
              <View className="mt-8 items-center rounded-2xl bg-white px-6 py-8">
                <Text className="text-base font-bold text-[#333333]">
                  実行中の公約はありません
                </Text>
                <Pressable
                  onPress={() => router.push("/election")}
                  className="mt-5 rounded-full bg-election-red px-7 py-3"
                >
                  <Text className="font-bold text-white">次の総選挙を開く</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {currentWish && reportAction ? (
        <ReportModal
          visible
          wish={currentWish}
          action={reportAction}
          onClose={() => setReportAction(null)}
        />
      ) : null}
    </View>
  );
}
