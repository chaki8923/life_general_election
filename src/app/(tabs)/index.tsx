import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  View as RNView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { FlowButton } from "@/components/ui/flow-button";
import { FlowHeader } from "@/components/ui/flow-header";
import { ProgressDots } from "@/components/ui/progress-dots";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { DevGuideButton } from "@/features/dev/dev-guide-button";
import { MypageGuideModal } from "@/features/onboarding/mypage-guide-modal";
import { deleteManagedPosterPhoto } from "@/features/poster/photo-storage";
import { PosterCard } from "@/features/poster/poster-card";
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
import { ReportModal } from "@/features/wishes/report-modal";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";
import { Image } from "@/tw/image";
import { Pressable, ScrollView, Text, View } from "@/tw";
import type { Wish } from "@/types";

const helpIcon = require("../../../assets/poster/icon-help.svg");

/** Figma 2703:24267。本文は左右20pxの350px幅に収まる */
const PAGE_HORIZONTAL_PADDING = 20;

export default function MyPageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<FlatList<Wish>>(null);
  const posterRef = useRef<RNView>(null);
  const wishes = useWishStore((state) => state.wishes);
  const hasHydrated = useWishStore((state) => state.hasHydrated);
  const removeWish = useWishStore((state) => state.removeWish);
  const nickname = useProfileStore((state) => state.profile?.nickname ?? "");
  const profileHydrated = useProfileStore((state) => state.hasHydrated);
  const mypageGuideSeen = useProfileStore((state) => state.mypageGuideSeen);
  const markMypageGuideSeen = useProfileStore(
    (state) => state.markMypageGuideSeen
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doneOpen, setDoneOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
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

  // Figma 2665:19111「初回ガイド」。初回訪問の1回だけ出す。
  // profileHydratedを見ないと、復元前の既定値(false)で既読ユーザーにも一瞬出てしまう
  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated || !profileHydrated) return;
      if (mypageGuideSeen) return;
      setGuideOpen(true);
    }, [hasHydrated, profileHydrated, mypageGuideSeen])
  );

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

  /** 1公約＝1ページ。実行中の政策カードと公約ポスターカードを縦に並べる（Figma 2703:24268 Body） */
  const renderPledgePage = ({
    item,
    index,
  }: {
    item: Wish;
    index: number;
  }) => {
    const settings = resolvePosterSettings(item, nickname);
    const isCurrent = index === safeCurrentIndex;
    return (
      <View style={{ width: carouselWidth }} className="gap-[8px]">
        <RunningPledgeCard
          wish={item}
          onDone={() => setDoneOpen(true)}
          onFailed={() =>
            router.push({
              pathname: "/wishes/excuse",
              params: { id: item.id },
            })
          }
        />
        <PosterCard
          settings={settings}
          slogan={item.text}
          palette={getPosterPalette(settings.paletteId)}
          // キャプチャは表示中の1枚だけを対象にする
          posterRef={isCurrent ? posterRef : undefined}
          onPhotoLoaded={isCurrent ? () => setPhotoReady(true) : undefined}
          onPressEdit={() => setEditOpen(true)}
          onPressSave={saveToLibrary}
          saveDisabled={!isCurrent || !exportable}
          saving={busy}
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
                "選んだ公約のポスターです。期日までに実行できたら「できた！」を押してください。ポスターは右上のアイコンで保存、下のリンクで編集できます。"
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
        contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPadding }}
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
            {/* ページャ（Figma 2703:24269 progress-bar-step4） */}
            {activeWishes.length >= 2 ? (
              <ProgressDots
                total={activeWishes.length}
                current={safeCurrentIndex}
              />
            ) : null}

            <FlatList
              ref={carouselRef}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              data={activeWishes}
              keyExtractor={(item) => item.id}
              renderItem={renderPledgePage}
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

            {/* Figma 2703:24324。削除は下線のテキストリンク */}
            <Pressable
              onPress={() => setDeleteOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="公約を削除する"
              className="items-center px-[24px] py-[12px] active:opacity-70"
            >
              <Text className="font-flow text-[12px] leading-[20px] tracking-[0.6px] text-flow-ink-low underline">
                公約を削除する
              </Text>
            </Pressable>
          </>
        )}

        <DevGuideButton
          onPress={() => setGuideOpen(true)}
          className="items-center py-2"
        />
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

      {currentWish && doneOpen ? (
        <ReportModal
          visible
          wish={currentWish}
          onClose={() => setDoneOpen(false)}
          onCompleted={() => router.push("/wishes/complete")}
        />
      ) : null}

      <MypageGuideModal
        visible={guideOpen}
        onClose={() => {
          setGuideOpen(false);
          markMypageGuideSeen();
        }}
      />
    </View>
  );
}
