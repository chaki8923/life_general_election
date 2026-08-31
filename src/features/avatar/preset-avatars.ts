import type { PosterPaletteId } from "@/types";

/**
 * ポスターに使える既製アバター。
 * Metroのrequireは動的パスを解決できないので17枚を明示的に並べる。
 * paletteId は絵柄の帽子・ポンポンの色に対応させたポスターの配色
 * （2枚のマップに分けると枚数の増減でズレるので1箇所にまとめている）。
 */
const PRESET_AVATARS = {
  topyo01: { source: require("../../../assets/avatar/topyo01.webp"), paletteId: "pink" },
  topyo02: { source: require("../../../assets/avatar/topyo02.webp"), paletteId: "purple" },
  topyo03: { source: require("../../../assets/avatar/topyo03.webp"), paletteId: "blue" },
  topyo04: { source: require("../../../assets/avatar/topyo04.webp"), paletteId: "green" },
  topyo05: { source: require("../../../assets/avatar/topyo05.webp"), paletteId: "blue" },
  topyo06: { source: require("../../../assets/avatar/topyo06.webp"), paletteId: "orange" },
  topyo07: { source: require("../../../assets/avatar/topyo07.webp"), paletteId: "purple" },
  topyo08: { source: require("../../../assets/avatar/topyo08.webp"), paletteId: "green" },
  topyo09: { source: require("../../../assets/avatar/topyo09.webp"), paletteId: "pink" },
  topyo10: { source: require("../../../assets/avatar/topyo10.webp"), paletteId: "purple" },
  topyo11: { source: require("../../../assets/avatar/topyo11.webp"), paletteId: "orange" },
  topyo12: { source: require("../../../assets/avatar/topyo12.webp"), paletteId: "blue" },
  topyo13: { source: require("../../../assets/avatar/topyo13.webp"), paletteId: "purple" },
  topyo14: { source: require("../../../assets/avatar/topyo14.webp"), paletteId: "blue" },
  topyo15: { source: require("../../../assets/avatar/topyo15.webp"), paletteId: "purple" },
  topyo16: { source: require("../../../assets/avatar/topyo16.webp"), paletteId: "orange" },
  topyo17: { source: require("../../../assets/avatar/topyo17.webp"), paletteId: "pink" },
} satisfies Record<string, { source: unknown; paletteId: PosterPaletteId }>;

export type PresetAvatarId = keyof typeof PRESET_AVATARS;

const PRESET_AVATAR_IDS = Object.keys(PRESET_AVATARS) as PresetAvatarId[];

/** 保存済みIDが未知のとき（枚数を減らした後など）はundefinedを返す */
export function getPresetAvatarSource(id: PresetAvatarId) {
  return PRESET_AVATARS[id]?.source as number | undefined;
}

/** 絵柄に合わせたポスターの配色。未知IDのときはundefined */
export function getPresetAvatarPaletteId(
  id: PresetAvatarId
): PosterPaletteId | undefined {
  return PRESET_AVATARS[id]?.paletteId;
}

/** 今と同じ絵を引かないよう、現在のIDを除いた中から選ぶ */
export function pickRandomPresetAvatarId(
  exclude?: PresetAvatarId
): PresetAvatarId {
  const pool = exclude
    ? PRESET_AVATAR_IDS.filter((id) => id !== exclude)
    : PRESET_AVATAR_IDS;
  return pool[Math.floor(Math.random() * pool.length)];
}
