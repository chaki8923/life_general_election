import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  View as RNView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { deleteManagedPosterPhoto } from "@/features/poster/photo-storage";
import { PosterCanvas } from "@/features/poster/poster-canvas";
import { PosterDeleteModal } from "@/features/poster/poster-delete-modal";
import { PosterEditModal } from "@/features/poster/poster-edit-modal";
import {
  createDefaultPosterSettings,
  getPosterImageUri,
  resolvePosterSettings,
} from "@/features/poster/poster-settings";
import { RunningPledgeCard } from "@/features/poster/running-pledge-card";
import { getPosterPalette } from "@/features/poster/templates";
import { usePosterExport } from "@/features/poster/use-poster-export";
import {
  ReportModal,
  type ReportAction,
} from "@/features/wishes/report-modal";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import { Image } from "@/tw/image";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { Wish } from "@/types";

const helpIcon = require("../../../assets/poster/icon-help.svg");
const editIcon = require("../../../assets/poster/icon-edit.svg");
const downloadIcon = require("../../../assets/poster/icon-download.svg");

/** Figma 2040:6120。本文は左右20pxの350px幅に収まる */
const PAGE_HORIZONTAL_PADDING = 20;
/** Figma 2040:6133 のカード枠線色 */
const BORDER = "#f6f6f6";
/**
 * ポスター右上の編集ボタン。SVGは影ぶんの余白込みで68.5、
 * 中の円(55.56)がカード座標で right 16.2 / top 17.2 に来る（Figma 2040:6168）
 */
const EDIT_BUTTON_SIZE = 68.5;
const EDIT_BUTTON_INSET = 10;

export default function MyPageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<FlatList<Wish>>(null);
  const posterRef = useRef<RNView>(null);
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);
  const removeWish = useWishStore((state) => state.removeWish);
  const nickname = useProfileStore((state) => state.profile?.nickname ?? "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reportAction, setReportAction] = useState<ReportAction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoReady, setPhotoReady] = useState(true);
  const bottomPadding = useTabBarBottomPadding();

  const activeWishes = wishes.filter((wish) => wish.status === "active");
  const carouselWidth = Math.max(1, width - PAGE_HORIZONTAL_PADDING * 2);
  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, activeWishes.length - 1)
  );
  const currentWish = activeWishes[safeCurrentIndex] ?? null;
  const storedSettings =
    currentWish?.posterSettings ?? createDefaultPosterSettings();
  const { busy, saveToLibrary } = usePosterExport(posterRef);

  const exportable =
    currentWish !== null &&
    !busy &&
    (storedSettings.image.kind === "character" || photoReady);

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
    if (next === safeCurrentIndex) return;
    setPhotoReady(true);
    setCurrentIndex(Math.max(0, Math.min(next, activeWishes.length - 1)));
  };

  // removeWish は写真ファイルまでは消さないので、先にファイルを片付ける
  const handleDelete = () => {
    if (!currentWish) return;
    deleteManagedPosterPhoto(getPosterImageUri(storedSettings.image));
    removeWish(currentWish.id);
    setDeleteOpen(false);
  };

  const renderPoster = ({ item, index }: { item: Wish; index: number }) => {
    const settings = resolvePosterSettings(item, nickname);
    const isCurrent = index === safeCurrentIndex;
    return (
      <View style={{ width: carouselWidth }}>
        <PosterCanvas
          settings={settings}
          slogan={item.text}
          palette={getPosterPalette(settings.paletteId)}
          // キャプチャは表示中の1枚だけを対象にする
          posterRef={isCurrent ? posterRef : undefined}
          onPhotoLoaded={isCurrent ? () => setPhotoReady(true) : undefined}
          interactive={isCurrent && !busy}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-flow-bg">
      <FlowHeader
        title="設定済みの公約・政策"
        hideBack
        right={
          <Pressable
            onPress={() =>
              Alert.alert(
                "設定済みの公約・政策",
                "選んだ公約のポスターです。右上の鉛筆で見た目を変えられます。期日までに実行できたら「できた！」を押してください。"
              )
            }
            accessibilityRole="button"
            accessibilityLabel="この画面のヘルプ"
            hitSlop={12}
          >
            <Image
              source={helpIcon}
              style={{ width: 24, height: 24, tintColor: "#24292f" }}
              contentFit="contain"
            />
          </Pressable>
        }
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: bottomPadding }}
      >
        {!hasHydrated ? (
          <View className="items-center py-20">
            <Text className="font-flow-medium text-sm text-flow-ink-low">
              公約を読み込んでいます…
            </Text>
          </View>
        ) : activeWishes.length === 0 ? (
          <View
            className="mt-10 items-center rounded-2xl bg-white px-6 py-10"
            style={{ marginHorizontal: PAGE_HORIZONTAL_PADDING }}
          >
            <Text className="font-flow text-lg text-flow-ink">
              まだ人生公約がありません
            </Text>
            <Text className="mt-3 text-center font-flow-medium text-sm leading-6 text-flow-ink-low">
              総選挙を開いて、最初の小さな一歩を決めましょう
            </Text>
            <FlowButton
              label="総選挙をはじめる"
              onPress={() => router.push("/election")}
              className="mt-6"
            />
          </View>
        ) : (
          <>
            {/* ページャ（Figma 2040:6125 progress-bar-step4） */}
            {activeWishes.length >= 2 ? (
              <View className="flex-row items-center justify-center gap-3 px-4 py-2">
                {activeWishes.map((wish, index) => (
                  <View
                    key={wish.id}
                    className={`h-2 w-2 rounded-full ${
                      index === safeCurrentIndex ? "bg-flow-ink" : "bg-[#d9d9d9]"
                    }`}
                  />
                ))}
              </View>
            ) : null}

            <View className="mt-2">
              <FlatList
                ref={carouselRef}
                horizontal
                pagingEnabled
                nestedScrollEnabled
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
                style={{
                  width: carouselWidth,
                  alignSelf: "center",
                }}
              />

              <Pressable
                onPress={() => setEditOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="ポスターを編集する"
                hitSlop={8}
                style={{
                  position: "absolute",
                  right: PAGE_HORIZONTAL_PADDING + EDIT_BUTTON_INSET,
                  top: EDIT_BUTTON_INSET,
                  width: EDIT_BUTTON_SIZE,
                  height: EDIT_BUTTON_SIZE,
                }}
              >
                <Image
                  source={editIcon}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </Pressable>
            </View>

            <View
              className="mt-4 gap-3"
              style={{ paddingHorizontal: PAGE_HORIZONTAL_PADDING }}
            >
              {currentWish ? (
                <RunningPledgeCard
                  wish={currentWish}
                  onDone={() => setReportAction("done")}
                  onFailed={() => setReportAction("excuse")}
                />
              ) : null}

              <Pressable
                onPress={saveToLibrary}
                disabled={!exportable}
                accessibilityRole="button"
                accessibilityState={{ disabled: !exportable, busy }}
                className={`flex-row items-center gap-2 rounded-xl bg-white p-3 ${
                  exportable ? "active:opacity-80" : "opacity-50"
                }`}
                style={{ borderWidth: 1, borderColor: BORDER }}
              >
                <Text className="flex-1 font-flow-medium text-sm text-flow-ink">
                  {busy ? "保存しています…" : "ポスターを保存する"}
                </Text>
                <Image
                  source={downloadIcon}
                  style={{ width: 18, height: 18 }}
                  contentFit="contain"
                />
              </Pressable>

              <FlowButton
                label="公約を削除する"
                variant="dashed"
                onPress={() => setDeleteOpen(true)}
              />
            </View>
          </>
        )}
      </ScrollView>

      {currentWish ? (
        <>
          <PosterEditModal
            visible={editOpen}
            wish={currentWish}
            settings={storedSettings}
            nicknamePlaceholder={nickname.trim()}
            onClose={() => setEditOpen(false)}
            onImageChanged={() => setPhotoReady(false)}
          />
          <PosterDeleteModal
            visible={deleteOpen}
            wish={currentWish}
            onConfirm={handleDelete}
            onClose={() => setDeleteOpen(false)}
          />
        </>
      ) : null}

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
