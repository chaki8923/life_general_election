import { Text, View } from "@/tw";
import { Stroked } from "./stroked-text";
import { NAME_BAND_TOP } from "./templates";
import { VerticalText } from "./vertical-text";

/**
 * ポスターの縦書きスローガン（Figma 2040:6130-6132）。
 * 右→左に列を送り、列ごとに少しずつ下へずらす。末尾に「!」を添える。
 * 座標はすべて 350×400 アートボード基準。
 */

/** 段組みを収める領域の右端。Figma: 1列目 left 74.8 + 字幅 40 */
const AREA_RIGHT = 114.8;
/** 最終列の左端の下限。ここを割るとカードからはみ出す */
const AREA_LEFT = 14;
/** スローガンが使える縦の範囲 */
const AREA_TOP = 49;
/** 氏名帯（後から描かれるので常に上に重なる）との間に残す余白 */
const BAND_GAP = 8;
const AREA_BOTTOM = NAME_BAND_TOP - BAND_GAP;
const AREA_HEIGHT = AREA_BOTTOM - AREA_TOP;
/** Figma: 2列目 top 130 - 1列目 top 49 */
const MAX_STAGGER = 81;
/** 収まらなければ順に落とす。40 は Figma 実測値 */
const FONT_STEPS = [40, 34, 28, 24, 20, 16, 14, 12];
const LINE_HEIGHT_RATIO = 1.1;
/** 列の左端どうしの間隔。Figma: (74.8 - 24) / 40 = 1.27 */
const COLUMN_GAP_RATIO = 1.27;
/** 末尾「!」の上に空ける間隔（lineHeight比） */
const BANG_MARGIN_RATIO = 0.05;
/** 縁取りが下へはみ出す量。stroked-text.tsx のオフセットと同じ比率 */
const STROKE_RATIO = 0.075;

/** そのフォントサイズで横に何列置けるか */
function columnCapacity(fontSize: number) {
  const gap = fontSize * COLUMN_GAP_RATIO;
  return Math.max(1, Math.floor((AREA_RIGHT - AREA_LEFT - fontSize) / gap) + 1);
}

/**
 * 列の実高さ。最終列は末尾の「!」（間隔＋1行）が付く。
 * 縁取りは文字の外へ広がるので、どの列でも足しておく。
 */
function columnHeight(len: number, fontSize: number, isLast: boolean) {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  return (
    len * lineHeight +
    (isLast ? lineHeight * (1 + BANG_MARGIN_RATIO) : 0) +
    fontSize * STROKE_RATIO
  );
}

/** そのフォントサイズで1列に何字入るか。「!」と縁取りのぶんを引いて数える */
function charCapacity(fontSize: number) {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const reserved = columnHeight(0, fontSize, true);
  return Math.max(1, Math.floor((AREA_HEIGHT - reserved) / lineHeight));
}

type Layout = {
  fontSize: number;
  lineHeight: number;
  columns: string[];
  stagger: number;
};

/**
 * 文字数から段組みを決める。
 * 縦（1列の字数）だけでなく横（置ける列数）でも制約しないと、
 * 列が増えたときに左端がカード外へ出る。
 */
function layoutSlogan(chars: string[]): Layout {
  const fontSize =
    FONT_STEPS.find(
      (size) =>
        Math.ceil(chars.length / charCapacity(size)) <= columnCapacity(size)
    ) ?? FONT_STEPS[FONT_STEPS.length - 1];

  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const perColumnLimit = charCapacity(fontSize);
  const columnCount = Math.min(
    columnCapacity(fontSize),
    Math.max(1, Math.ceil(chars.length / perColumnLimit))
  );

  // 最小フォントでも入りきらないぶんは末尾を「…」にして落とす。
  // ここで切らないと columnCount が頭打ちのまま1列の字数だけ増え、
  // 列が氏名帯へ潜り込む
  const capacity = perColumnLimit * columnCount;
  const shown =
    chars.length <= capacity
      ? chars
      : [...chars.slice(0, Math.max(0, capacity - 1)), "…"];

  // 列ごとの字数は均す（4+3 のように末尾列だけ極端に短くならないように）
  const perColumn = Math.ceil(shown.length / columnCount);
  const columns = Array.from({ length: columnCount }, (_, index) =>
    shown.slice(index * perColumn, (index + 1) * perColumn).join("")
  ).filter((column) => column.length > 0);

  // どの列も下端を割らない範囲までしかずらさない。
  // 1列目はずらさないので、収まっているかどうかだけ見る
  const lastIndex = columns.length - 1;
  const stagger = columns.reduce((limit, column, index) => {
    const height = columnHeight(column.length, fontSize, index === lastIndex);
    if (index === 0) return height <= AREA_HEIGHT ? limit : 0;
    return Math.min(limit, (AREA_HEIGHT - height) / index);
  }, MAX_STAGGER);

  return {
    fontSize,
    lineHeight,
    columns,
    stagger: columns.length > 1 ? Math.max(0, stagger) : 0,
  };
}

type Props = {
  text: string;
  /** アートボード値を実サイズへ変換する */
  s: (value: number) => number;
  fillColor: string;
  strokeColor: string;
};

export function VerticalSlogan({ text, s, fillColor, strokeColor }: Props) {
  const chars = [...text.trim()];
  if (chars.length === 0) return null;

  const { fontSize, lineHeight, columns, stagger } = layoutSlogan(chars);
  const columnGap = fontSize * COLUMN_GAP_RATIO;
  const lastIndex = columns.length - 1;
  // 右端固定だと、フォントが40から落ちたとき左だけ余白が残る。領域の中央に置く。
  // columnCapacity() が blockWidth <= 領域幅 を保証するのでオフセットは負にならない
  const blockWidth = fontSize + lastIndex * columnGap;
  const blockRight = AREA_RIGHT - (AREA_RIGHT - AREA_LEFT - blockWidth) / 2;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0"
      accessibilityLabel={text}
    >
      {columns.map((column, index) => {
        const left = blockRight - fontSize - index * columnGap;
        const top = AREA_TOP + index * stagger;
        return (
          <View
            key={`${index}-${column}`}
            style={{
              position: "absolute",
              left: s(left),
              top: s(top),
              width: s(fontSize),
            }}
          >
            <Stroked
              fontSize={s(fontSize)}
              fillColor={fillColor}
              strokeColor={strokeColor}
              render={(color) => (
                <VerticalText
                  text={column}
                  fontSize={s(fontSize)}
                  lineHeight={s(lineHeight)}
                  color={color}
                />
              )}
            />
            {/* 末尾の「!」は最終列の真下に置く。Figmaは「!!」だが、列幅は1文字ぶん
                しかなく2文字だと ellipsize されて三点リーダが切れ残るため1つにしている。
                高さは1行ぶんに固定して columnHeight() の計算と一致させる */}
            {index === lastIndex ? (
              <View
                style={{
                  marginTop: s(lineHeight) * BANG_MARGIN_RATIO,
                  height: s(lineHeight),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stroked
                  fontSize={s(fontSize)}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                  render={(color) => (
                    <Text
                      numberOfLines={1}
                      className="font-flow"
                      style={{
                        fontSize: s(fontSize),
                        lineHeight: s(lineHeight),
                        includeFontPadding: false,
                        color,
                      }}
                    >
                      !
                    </Text>
                  )}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
