import { Directory, File, Paths } from "expo-file-system";

export type PickedPosterImage = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

const POSTER_PHOTO_DIRECTORY = "poster-photos";

function fileExtension(asset: PickedPosterImage) {
  const fromName = asset.fileName?.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  if (fromName) return fromName.toLowerCase();
  const fromMime = asset.mimeType?.split("/")[1];
  return fromMime === "jpeg" ? "jpg" : fromMime || "jpg";
}

export function isManagedPosterPhoto(uri: string) {
  return uri.includes(`/${POSTER_PHOTO_DIRECTORY}/`);
}

export async function persistPosterPhoto(
  wishId: string,
  asset: PickedPosterImage
) {
  if (process.env.EXPO_OS === "web") {
    if (asset.base64) {
      return `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    }
    return asset.uri;
  }

  const directory = new Directory(Paths.document, POSTER_PHOTO_DIRECTORY);
  directory.create({ idempotent: true, intermediates: true });
  const destination = new File(
    directory,
    `${wishId}-${Date.now()}.${fileExtension(asset)}`
  );
  new File(asset.uri).copy(destination);
  return destination.uri;
}

export function deleteManagedPosterPhoto(uri: string | undefined) {
  if (!uri || process.env.EXPO_OS === "web" || !isManagedPosterPhoto(uri)) {
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    if (__DEV__) console.warn("[poster/photo-storage]", error);
  }
}
