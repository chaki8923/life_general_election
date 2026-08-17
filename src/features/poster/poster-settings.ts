import type {
  PosterImageSource,
  PosterPaletteId,
  PosterSettings,
  Wish,
} from "@/types";

export const DEFAULT_POSTER_PALETTE_ID: PosterPaletteId = "pink";

export function createDefaultPosterSettings(): PosterSettings {
  return {
    image: { kind: "character" },
    candidateName: "",
    paletteId: DEFAULT_POSTER_PALETTE_ID,
  };
}

/**
 * 端末に実ファイルを持つ画像（アップロード写真）のURI。それ以外はundefined。
 * 既定キャラも既製アバターもバンドル同梱なので掃除の対象にならない。
 */
export function getPosterImageUri(
  image: PosterImageSource
): string | undefined {
  return image.kind === "photo" ? image.uri : undefined;
}

export function resolvePosterSettings(
  wish: Wish,
  profileNickname: string
): PosterSettings {
  const settings = wish.posterSettings ?? createDefaultPosterSettings();
  return {
    ...settings,
    candidateName: settings.candidateName.trim() || profileNickname.trim(),
  };
}
