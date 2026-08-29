import { useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { formatDate } from "@/utils/date";

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
/** Figma 2317:23379 — 日付ラベルありトラック高さ */
const TRACK_HEIGHT_LABELED = GRAPH_HEIGHT;
/** Figma Ellipse r=6 on 16px track → 直径12 */
const DOT_SIZE_ON_16 = 12;
/** Figma 2317:23462 — 空状態の白丸位置（cx=26 相当） */
const EMPTY_DOT_EDGE_INSET = 26;
/** Figma 2317:23404 — YYYY/MM/DD ラベル幅（12px・10文字） */
const LABEL_WIDTH = 80;
/** トラックと日付ラベルの間隔（Figma 2317:23378 gap 12） */
const LABEL_GAP = 12;
/** Figma 2317:23378 — タイムラインブロック高さ（1セット分） */
const TIMELINE_SET_HEIGHT = TRACK_HEIGHT_LABELED + LABEL_GAP + 17;
/** Figma 2317:23427 トラック背景 */
const TRACK_BG = "#d8d8d8";
/** Figma 2317:23448 経過部分（text/high） */
const PROGRESS_BG = "#24292f";

/** Figma 2317:23462 — 公約数に依存しない固定日付バー（白丸1個） */
function HistoryEmptyTimelineTrack() {
  const { s } = useDesignScale();
  const trackHeight = s(GRAPH_HEIGHT);
  const trackInnerHeight = s(TRACK_HEIGHT_INNER);
  const trackTopInset = s(TRACK_TOP_INSET);
  const dotSize = s(DOT_SIZE_ON_16);
  const dotCenter = s(EMPTY_DOT_EDGE_INSET);

  return (
    <View className="w-full overflow-hidden" style={{ height: trackHeight }}>
      <View style={{ width: "100%", height: trackHeight }}>
        <View
          style={{
            position: "absolute",
            left: 0,
            top: trackTopInset,
            height: trackInnerHeight,
            width: "100%",
            borderRadius: trackInnerHeight / 2,
            backgroundColor: TRACK_BG,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-white"
          style={{
            width: dotSize,
            height: dotSize,
            left: dotCenter - dotSize / 2,
            top: trackTopInset + (trackInnerHeight - dotSize) / 2,
          }}
        />
      </View>
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
  /** カード列の最大スクロール量（実機px） */
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
    ...dotLefts.map((left) => left + s(LABEL_WIDTH))
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
          {dotLefts.map((left, index) => (
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

/**
 * Figma 2317:23462 — 空状態用の固定日付バー（横スクロールなし・公約数非連動）。
 */
export function HistoryTimelineBar() {
  return <HistoryEmptyTimelineTrack />;
}
