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
 * 既定キャラ以外（写真/AI生成）で表示するURI。既定キャラならundefined。
 * kindが増えても分岐がここだけで済むようにするためのヘルパー。
 */
export function getPosterImageUri(
  image: PosterImageSource
): string | undefined {
  return image.kind === "character" ? undefined : image.uri;
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
