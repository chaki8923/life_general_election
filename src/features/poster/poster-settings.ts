import type { PosterPaletteId, PosterSettings, Wish } from "@/types";

export const DEFAULT_POSTER_PALETTE_ID: PosterPaletteId = "pink";

export function createDefaultPosterSettings(): PosterSettings {
  return {
    image: { kind: "character" },
    candidateName: "",
    paletteId: DEFAULT_POSTER_PALETTE_ID,
  };
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
