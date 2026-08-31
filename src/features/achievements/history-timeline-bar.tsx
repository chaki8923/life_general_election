import { useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { formatDate } from "@/utils/date";

/** Figma 2317:23379 — グラフ領域の高さ */
const GRAPH_HEIGHT = 16;
/** Figma 2317:23181 — グレートラック高さ（16px 内で上下2pxインセット） */
const TRACK_HEIGHT_INNER = 12;
/** グレートラックの上オフセット（(16-12)/2） */
const TRACK_TOP_INSET = 2;
/** Figma 2317:23381 — カード左端から白丸左端までのオフセット */
const LINKED_DOT_INSET = 20;
/** Figma 2317:23377 / 2317:23491 — 見出し・カード左端・日付ラベルの開始位置 */
export const HISTORY_TIMELINE_LEAD_INSET = 20;
/** 1枚目白丸の左側／最後の白丸の右側に見せるバー延長（デザインpx） */
const PROGRESS_LEAD_BEFORE_DOT = 23;
/** Figma 2317:23382 — 白丸間隔はカード1枚分+2px（322px） */
const LINKED_DOT_STRIDE_EXTRA = 2;
/** Figma 2317:23379 — 日付ラベルありトラック高さ */
const TRACK_HEIGHT_LABELED = GRAPH_HEIGHT;
/** Figma Ellipse r=6 on 16px track → 直径12 */
const DOT_SIZE_ON_16 = 12;
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

function useHistoryTimelineLayout() {
  const { s } = useDesignScale();
  const cardLead = s(HISTORY_TIMELINE_LEAD_INSET);
  const dotLead = cardLead + s(LINKED_DOT_INSET);
  const barLead = s(PROGRESS_LEAD_BEFORE_DOT);
  const barStart = dotLead - barLead;

  return {
    s,
    trackTopInset: s(TRACK_TOP_INSET),
    trackInnerHeight: s(TRACK_HEIGHT_INNER),
    dotSize: s(DOT_SIZE_ON_16),
    cardLead,
    dotLead,
    barStart,
  };
}

/** Figma 2317:23462 — 公約数に依存しない固定日付バー（白丸1個） */
function HistoryEmptyTimelineTrack() {
  const { s, trackTopInset, trackInnerHeight, dotSize, dotLead, barStart } =
    useHistoryTimelineLayout();
  const trackHeight = s(GRAPH_HEIGHT);

  return (
    <View className="w-full overflow-hidden" style={{ height: trackHeight }}>
      <View style={{ width: "100%", height: trackHeight }}>
        <View
          style={{
            position: "absolute",
            left: barStart,
            top: trackTopInset,
            height: trackInnerHeight,
            right: 0,
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
            left: dotLead,
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
  /** カード列の横スクロール量（実機px）。白丸・ラベルの同期移動に使用 */
  scrollX?: number;
};

/** 最後のカード白丸右端まで濃色バーを固定表示（Figma 2317:23180） */
function getFixedProgressWidth(
  dotLefts: number[],
  dotSize: number,
  scale: (value: number) => number
): number {
  const lastDotLeft = dotLefts[dotLefts.length - 1] ?? 0;
  return lastDotLeft + dotSize + scale(PROGRESS_LEAD_BEFORE_DOT);
}

/** カード列と同期する繋がった日付バー（Figma 2317:23180 ほか） */
export function HistoryLinkedTimelineTrack({
  dates,
  cardWidth,
  cardGap,
  scrollX = 0,
}: HistoryLinkedTimelineTrackProps) {
  const { s } = useDesignScale();
  const count = dates.length;
  if (count === 0) return null;

  const scaledCardWidth = s(cardWidth);
  const scaledGap = s(cardGap);
  const scaledDotStride = s(cardWidth + cardGap + LINKED_DOT_STRIDE_EXTRA);
  const trackWidth =
    count * scaledCardWidth + Math.max(count - 1, 0) * scaledGap;
  const trackHeight = s(TRACK_HEIGHT_LABELED);
  const trackInnerHeight = s(TRACK_HEIGHT_INNER);
  const trackTopInset = s(TRACK_TOP_INSET);
  const dotSize = s(DOT_SIZE_ON_16);
  const cardLead = s(HISTORY_TIMELINE_LEAD_INSET);
  const dotLead = cardLead + s(LINKED_DOT_INSET);
  const barLead = s(PROGRESS_LEAD_BEFORE_DOT);
  const barStart = dotLead - barLead;
  const cardStride = scaledCardWidth + scaledGap;

  const dotLefts = Array.from(
    { length: count },
    (_, index) => dotLead + index * scaledDotStride
  );
  const labelLefts = Array.from(
    { length: count },
    (_, index) => cardLead + index * cardStride
  );
  const progressEnd = getFixedProgressWidth(dotLefts, dotSize, s);
  const progressWidth = Math.max(0, progressEnd - barStart);

  const contentWidth = Math.max(
    cardLead + trackWidth,
    progressEnd,
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
            width: cardLead + trackWidth,
          }}
        >
          <View
            style={{
              position: "absolute",
              left: barStart,
              top: trackTopInset,
              height: trackInnerHeight,
              width: cardLead + trackWidth - barStart,
              borderRadius: trackInnerHeight / 2,
              backgroundColor: TRACK_BG,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: barStart,
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

/**
 * Figma 2317:23462 — 空状態用の固定日付バー（横スクロールなし・公約数非連動）。
 */
export function HistoryTimelineBar() {
  return <HistoryEmptyTimelineTrack />;
}
