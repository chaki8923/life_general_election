import { useMemo } from "react";
import { useDesignScale } from "@/features/election/layout";
import { formatDate } from "@/utils/date";
import { ScrollView, Text, View } from "@/tw";

/** Figma 2317:23379 — グラフ領域の高さ */
const GRAPH_HEIGHT = 16;
/** Figma 2317:23181 — グレートラック高さ（16px 内で上下2pxインセット） */
const TRACK_HEIGHT_INNER = 12;
/** グレートラックの上オフセット（(16-12)/2） */
const TRACK_TOP_INSET = 2;
/** Figma 2317:23401 — 1枚目表示時の濃色バー幅 */
const FIRST_PROGRESS_WIDTH = 52;
/** Figma 2317:23381 — カード左端から白丸左端までのオフセット */
const LINKED_DOT_INSET = 20;
/** Figma 2317:23382 — 白丸間隔はカード1枚分+2px（322px） */
const LINKED_DOT_STRIDE_EXTRA = 2;
/**
 * Figma 濃色バー幅（カード番号ごと）
 * 1枚目 2317:23295 / 2枚目 2317:23202 / 3枚目 2317:23232 / 4枚目 2317:23263
 */
const LINKED_PROGRESS_WIDTHS = [52, 371, 696, 1018] as const;
/** 末尾スクロール付近で濃色を最後まで届かせる許容px */
const PROGRESS_NEAR_END_EPSILON = 8;
/** Figma 2317:23427 — 空状態トラック高さ（デザインpx） */
const TRACK_HEIGHT_EMPTY = 14;
/** Figma 2317:23379 — 日付ラベルありトラック高さ */
const TRACK_HEIGHT_LABELED = GRAPH_HEIGHT;
/** Figma Ellipse r=6 on 16px track → 直径12 */
const DOT_SIZE_ON_16 = 12;
export const DATE_STEP_LABELED = 272;
/** ラベルなし時のマーカー間隔 */
const DATE_STEP_COMPACT = 88;
/** Figma 2317:23462 — 白丸の左右インセット（cx=26 相当） */
const DOT_EDGE_INSET = 26;
/** Figma 2317:23404 — YYYY/MM/DD ラベル幅（12px・10文字） */
const LABEL_WIDTH = 80;
/** トラックと日付ラベルの間隔（Figma 2317:23378 gap 12） */
const LABEL_GAP = 12;
/** Figma 2317:23378 — タイムラインブロック高さ（1セット分） */
export const TIMELINE_SET_HEIGHT =
  TRACK_HEIGHT_LABELED + LABEL_GAP + 17;
/** Figma 2317:23427 トラック背景 */
const TRACK_BG = "#d8d8d8";
/** Figma 2317:23448 経過部分（text/high） */
const PROGRESS_BG = "#24292f";

type TimelineLayout = {
  trackHeight: number;
  dotSize: number;
  innerTrackWidth: number;
  contentWidth: number;
  dotPositions: number[];
  labelLefts: number[];
  progressWidth: number;
  showDateLabels: boolean;
};

function buildTrackWidth(
  pointCount: number,
  edgeInset: number,
  step: number,
  dotSize: number
) {
  if (pointCount <= 0) return edgeInset * 2;
  if (pointCount === 1) return edgeInset * 2 + dotSize;
  return edgeInset + (pointCount - 1) * step + edgeInset;
}

function buildDotPositions(pointCount: number, edgeInset: number, step: number) {
  if (pointCount <= 0) return [];
  if (pointCount === 1) return [edgeInset];
  return Array.from({ length: pointCount }, (_, index) => edgeInset + index * step);
}

function useTimelineLayout(
  dates: number[],
  showDateLabels: boolean
): TimelineLayout & { points: number[] } {
  const { s } = useDesignScale();

  const points = useMemo(() => {
    const unique = [...new Set(dates.filter(Boolean))].sort((a, b) => a - b);
    if (unique.length >= 1) return unique;
    const now = Date.now();
    const end = now + 30 * 24 * 60 * 60 * 1000;
    return [now, end];
  }, [dates]);

  const minTs = points[0];
  const maxTs = points[points.length - 1];
  const span = Math.max(maxTs - minTs, 1);
  const now = Date.now();
  const progress =
    points.length <= 1
      ? minTs <= now
        ? 1
        : 0
      : Math.min(1, Math.max(0, (now - minTs) / span));

  const trackHeight = s(
    showDateLabels ? TRACK_HEIGHT_LABELED : TRACK_HEIGHT_EMPTY
  );
  const dotSize = s(DOT_SIZE_ON_16);
  const edgeInset = s(DOT_EDGE_INSET);
  const step = s(showDateLabels ? DATE_STEP_LABELED : DATE_STEP_COMPACT);
  const labelHalf = s(LABEL_WIDTH / 2);

  const innerTrackWidth = buildTrackWidth(
    points.length,
    edgeInset,
    step,
    dotSize
  );
  const dotPositions = buildDotPositions(points.length, edgeInset, step);
  const labelLefts = showDateLabels
    ? dotPositions.map((center) => Math.max(0, center - labelHalf))
    : [];
  const contentWidth = showDateLabels
    ? Math.max(
        innerTrackWidth,
        ...labelLefts.map((left) => left + s(LABEL_WIDTH))
      )
    : innerTrackWidth;

  return {
    points,
    trackHeight,
    dotSize,
    innerTrackWidth,
    contentWidth,
    dotPositions,
    labelLefts,
    progressWidth: innerTrackWidth * progress,
    showDateLabels,
  };
}

type HistoryTimelineTrackProps = {
  dates: number[];
  showDateLabels?: boolean;
  /** 親スライド幅に合わせる（カード列より広い場合） */
  width?: number;
};

/**
 * 日付バー本体（スクロールなし）。親の横スクロールと連動させる。
 */
export function HistoryTimelineTrack({
  dates,
  showDateLabels = false,
  width,
}: HistoryTimelineTrackProps) {
  const { s } = useDesignScale();
  const layout = useTimelineLayout(dates, showDateLabels);
  const blockWidth = width ?? layout.contentWidth;

  return (
    <View
      style={{
        width: blockWidth,
        gap: showDateLabels ? s(LABEL_GAP) : 0,
        overflow: "visible",
      }}
    >
      <View
        style={{
          height: layout.trackHeight,
          width: layout.innerTrackWidth,
          borderRadius: layout.trackHeight / 2,
          backgroundColor: TRACK_BG,
        }}
        className="overflow-hidden"
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: layout.progressWidth,
            height: layout.trackHeight,
            borderRadius: layout.trackHeight / 2,
            backgroundColor: PROGRESS_BG,
          }}
        />
        {layout.dotPositions.map((left, index) => (
          <View
            key={layout.points[index]}
            className="absolute rounded-full bg-white"
            style={{
              width: layout.dotSize,
              height: layout.dotSize,
              left: left - layout.dotSize / 2,
              top: (layout.trackHeight - layout.dotSize) / 2,
            }}
          />
        ))}
      </View>

      {showDateLabels ? (
        <View
          style={{
            width: blockWidth,
            height: s(17),
            overflow: "visible",
          }}
        >
          {layout.labelLefts.map((left, index) => (
            <Text
              key={`label-${layout.points[index]}`}
              className="absolute text-center font-flow-regular text-[#999999]"
              numberOfLines={1}
              style={{
                fontSize: s(12),
                lineHeight: s(12 * 1.4),
                width: s(LABEL_WIDTH),
                left,
              }}
            >
              {formatDate(layout.points[index])}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type HistoryLinkedTimelineTrackProps = {
  dates: number[];
  /** カード幅（デザインpx） */
  cardWidth: number;
  /** カード間隔（デザインpx） */
  cardGap: number;
  /** カード列の横スクロール量（実機px） */
  scrollX?: number;
  /** カード列の最大スクロール量（実機px）。末尾カードが右寄せのとき stride×(n-1) より小さい */
  maxScrollX?: number;
};

function getLinkedProgressWidth(
  scrollX: number,
  count: number,
  maxScrollX: number,
  scale: (value: number) => number,
  cardWidth: number,
  cardGap: number
): number {
  const maxIndex = count - 1;
  if (maxIndex <= 0) return scale(LINKED_PROGRESS_WIDTHS[0]);

  const progressAt = (index: number) => {
    if (index < LINKED_PROGRESS_WIDTHS.length) {
      return scale(LINKED_PROGRESS_WIDTHS[index]);
    }
    const dotStride = cardWidth + cardGap + LINKED_DOT_STRIDE_EXTRA;
    return scale(
      LINKED_DOT_INSET + index * dotStride + FIRST_PROGRESS_WIDTH - LINKED_DOT_INSET
    );
  };

  if (maxScrollX <= 0) {
    return progressAt(maxIndex);
  }

  let clampedScroll = Math.min(Math.max(scrollX, 0), maxScrollX);
  if (maxScrollX - clampedScroll <= PROGRESS_NEAR_END_EPSILON) {
    clampedScroll = maxScrollX;
  }
  const rawIndex = (clampedScroll / maxScrollX) * maxIndex;
  const index = Math.min(maxIndex, Math.floor(rawIndex));
  const t = Math.min(1, Math.max(0, rawIndex - index));

  if (index >= maxIndex) return progressAt(maxIndex);
  return progressAt(index) + (progressAt(index + 1) - progressAt(index)) * t;
}

/** カード列と同期する繋がった日付バー（Figma 2317:23180 ほか） */
export function HistoryLinkedTimelineTrack({
  dates,
  cardWidth,
  cardGap,
  scrollX = 0,
  maxScrollX,
}: HistoryLinkedTimelineTrackProps) {
  const { s } = useDesignScale();
  const count = dates.length;
  if (count === 0) return null;

  const scaledCardWidth = s(cardWidth);
  const scaledGap = s(cardGap);
  const stride = scaledCardWidth + scaledGap;
  const scaledDotStride = s(cardWidth + cardGap + LINKED_DOT_STRIDE_EXTRA);
  const trackWidth =
    count * scaledCardWidth + Math.max(count - 1, 0) * scaledGap;
  const trackHeight = s(TRACK_HEIGHT_LABELED);
  const trackInnerHeight = s(TRACK_HEIGHT_INNER);
  const trackTopInset = s(TRACK_TOP_INSET);
  const dotSize = s(DOT_SIZE_ON_16);
  const dotInset = s(LINKED_DOT_INSET);

  const dotLefts = Array.from(
    { length: count },
    (_, index) => dotInset + index * scaledDotStride
  );
  const labelLefts = dotLefts.map((left) => Math.max(0, left));
  const resolvedMaxScrollX =
    maxScrollX ?? Math.max(0, (count - 1) * stride);
  const progressWidth = getLinkedProgressWidth(
    scrollX,
    count,
    resolvedMaxScrollX,
    s,
    cardWidth,
    cardGap
  );

  const contentWidth = Math.max(
    trackWidth,
    ...labelLefts.map((left) => left + s(LABEL_WIDTH))
  );

  return (
    <View
      className="w-full overflow-hidden"
      style={{
        height: s(TIMELINE_SET_HEIGHT),
      }}
    >
      <View
        style={{
          transform: [{ translateX: -scrollX }],
          width: contentWidth,
          gap: s(LABEL_GAP),
        }}
      >
        <View
          style={{
            height: trackHeight,
            width: trackWidth,
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              top: trackTopInset,
              height: trackInnerHeight,
              width: trackWidth,
              borderRadius: trackInnerHeight / 2,
              backgroundColor: TRACK_BG,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: progressWidth,
              height: trackHeight,
              borderRadius: trackHeight / 2,
              backgroundColor: PROGRESS_BG,
            }}
          />
          {dotLefts.map((left, index) => (
            <View
              key={dates[index]}
              pointerEvents="none"
              className="absolute rounded-full bg-white"
              style={{
                width: dotSize,
                height: dotSize,
                left,
                top: trackTopInset + (trackInnerHeight - dotSize) / 2,
              }}
            />
          ))}
        </View>
        <View
          style={{
            width: contentWidth,
            height: s(17),
          }}
        >
          {labelLefts.map((left, index) => (
            <Text
              key={`label-${dates[index]}`}
              className="font-flow-regular text-[#999999]"
              numberOfLines={1}
              style={{
                position: "absolute",
                fontSize: s(12),
                lineHeight: s(12 * 1.4),
                width: s(LABEL_WIDTH),
                left,
              }}
            >
              {formatDate(dates[index])}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

type HistoryTimelineBarProps = {
  /** タイムライン上の日付（ms）。重複は間引く */
  dates: number[];
  /** 達成日ラベルを白丸下に表示（履歴あり時） */
  showDateLabels?: boolean;
};

/**
 * Figma 2317:23378 / 2317:23462 — 空状態用の独立スクロール日付バー。
 */
export function HistoryTimelineBar({
  dates,
  showDateLabels = false,
}: HistoryTimelineBarProps) {
  const layout = useTimelineLayout(dates, showDateLabels);

  return (
    <View className="w-full">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: layout.contentWidth }}
      >
        <HistoryTimelineTrack
          dates={dates}
          showDateLabels={showDateLabels}
          width={layout.contentWidth}
        />
      </ScrollView>
    </View>
  );
}
