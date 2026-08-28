import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView as RNScrollView, View } from "react-native";

type PageApi = {
  page: number;
  goToPage: (page: number) => void;
};

type ResultPagedRowProps = {
  pageCount: number;
  /** ページ間ギャップ（実機px。s() 済みを渡す） */
  gap: number;
  /** 幅未計測時のプレースホルダ高さ */
  placeholderHeight: number;
  onPageChange?: (page: number) => void;
  renderPage: (index: number, api: PageApi) => ReactNode;
};

/**
 * 横スワイプページャ。
 * - コンテナ幅変化で ScrollView を再マウント
 * - snapToOffsets でギャップ付きでもページ位置がズレにくい
 */
export function ResultPagedRow({
  pageCount,
  gap,
  placeholderHeight,
  onPageChange,
  renderPage,
}: ResultPagedRowProps) {
  const scrollRef = useRef<RNScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [page, setPage] = useState(0);
  const stride = pageWidth + gap;

  const snapOffsets = useMemo(
    () => Array.from({ length: pageCount }, (_, i) => i * stride),
    [pageCount, stride]
  );

  const goToPage = useCallback(
    (next: number) => {
      if (pageWidth <= 0) return;
      const clamped = Math.max(0, Math.min(pageCount - 1, next));
      scrollRef.current?.scrollTo({
        x: clamped * (pageWidth + gap),
        animated: true,
      });
      setPage(clamped);
      onPageChange?.(clamped);
    },
    [gap, onPageChange, pageCount, pageWidth]
  );

  const syncPage = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0 || stride <= 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / stride);
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    setPage(clamped);
    onPageChange?.(clamped);
  };

  const api: PageApi = { page, goToPage };

  return (
    <View
      className="w-full overflow-hidden"
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0 && next !== pageWidth) {
          setPageWidth(next);
          setPage(0);
          onPageChange?.(0);
        }
      }}
    >
      {pageWidth > 0 ? (
        <RNScrollView
          key={pageWidth}
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={syncPage}
          onScrollEndDrag={syncPage}
          decelerationRate="fast"
          snapToOffsets={snapOffsets}
          disableIntervalMomentum
        >
          {Array.from({ length: pageCount }, (_, index) => (
            <View
              key={index}
              style={{
                width: pageWidth,
                marginRight: index < pageCount - 1 ? gap : 0,
              }}
            >
              {renderPage(index, api)}
            </View>
          ))}
        </RNScrollView>
      ) : (
        <View style={{ height: placeholderHeight }} />
      )}
    </View>
  );
}
