export const POSTER_LEVEL_THRESHOLDS = [0, 1, 3, 5, 10, 20, 30] as const;

export type PosterLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const POSTER_LEVEL_META: Record<
  PosterLevel,
  { title: string; shortTitle: string; description: string }
> = {
  0: {
    title: "無名の新人",
    shortTitle: "新人",
    description: "すべてはここから。手書きの一枚で第一声。",
  },
  1: {
    title: "地道な活動家",
    shortTitle: "活動家",
    description: "一つの実績が、白黒ポスターに自信を宿す。",
  },
  2: {
    title: "市議会への挑戦者",
    shortTitle: "挑戦者",
    description: "街で目を引く、堂々たる二色刷り。",
  },
  3: {
    title: "県政のホープ",
    shortTitle: "ホープ",
    description: "プロの風格と、前へ進むアクション。",
  },
  4: {
    title: "国政の注目株",
    shortTitle: "注目株",
    description: "実績が光沢と公認バッジに変わる。",
  },
  5: {
    title: "党首・大臣クラス",
    shortTitle: "カリスマ",
    description: "仲間と光を背負う、カリスマの一枚。",
  },
  6: {
    title: "歴史に名を刻む偉人",
    shortTitle: "レジェンド",
    description: "ポスターの枠を超えた、究極の存在感。",
  },
};

export function getPosterLevel(doneCount: number): PosterLevel {
  const safeCount = Math.max(0, Math.floor(doneCount));
  for (let level = POSTER_LEVEL_THRESHOLDS.length - 1; level >= 0; level -= 1) {
    if (safeCount >= POSTER_LEVEL_THRESHOLDS[level]) {
      return level as PosterLevel;
    }
  }
  return 0;
}

export function getPosterLevelProgress(doneCount: number) {
  const level = getPosterLevel(doneCount);
  if (level === 6) {
    return { level, current: doneCount, nextAt: null, remaining: 0, ratio: 1 };
  }
  const start = POSTER_LEVEL_THRESHOLDS[level];
  const nextAt = POSTER_LEVEL_THRESHOLDS[level + 1];
  const current = Math.max(start, doneCount);
  return {
    level,
    current,
    nextAt,
    remaining: Math.max(0, nextAt - current),
    ratio: Math.max(0, Math.min(1, (current - start) / (nextAt - start))),
  };
}
