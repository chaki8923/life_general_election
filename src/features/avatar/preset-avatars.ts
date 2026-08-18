/**
 * ポスターに使える既製アバター。
 * Metroのrequireは動的パスを解決できないので17枚を明示的に並べる。
 */
const PRESET_AVATARS = {
  topyo01: require("../../../assets/avatar/topyo01.png"),
  topyo02: require("../../../assets/avatar/topyo02.png"),
  topyo03: require("../../../assets/avatar/topyo03.png"),
  topyo04: require("../../../assets/avatar/topyo04.png"),
  topyo05: require("../../../assets/avatar/topyo05.png"),
  topyo06: require("../../../assets/avatar/topyo06.png"),
  topyo07: require("../../../assets/avatar/topyo07.png"),
  topyo08: require("../../../assets/avatar/topyo08.png"),
  topyo09: require("../../../assets/avatar/topyo09.png"),
  topyo10: require("../../../assets/avatar/topyo10.png"),
  topyo11: require("../../../assets/avatar/topyo11.png"),
  topyo12: require("../../../assets/avatar/topyo12.png"),
  topyo13: require("../../../assets/avatar/topyo13.png"),
  topyo14: require("../../../assets/avatar/topyo14.png"),
  topyo15: require("../../../assets/avatar/topyo15.png"),
  topyo16: require("../../../assets/avatar/topyo16.png"),
  topyo17: require("../../../assets/avatar/topyo17.png"),
} as const;

export type PresetAvatarId = keyof typeof PRESET_AVATARS;

const PRESET_AVATAR_IDS = Object.keys(PRESET_AVATARS) as PresetAvatarId[];

/** 保存済みIDが未知のとき（枚数を減らした後など）はundefinedを返す */
export function getPresetAvatarSource(id: PresetAvatarId) {
  return PRESET_AVATARS[id] as number | undefined;
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
