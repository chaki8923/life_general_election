import { Directory, File, Paths } from "expo-file-system";
import { readAsStringAsync, writeAsStringAsync } from "expo-file-system/legacy";

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

/**
 * AI生成画像(base64)を保存してURIを返す。
 * 保存先は写真と同じディレクトリ。deleteManagedPosterPhotoの掃除対象に載せるため。
 */
export async function persistGeneratedPosterImage(
  wishId: string,
  image: { base64: string; mimeType: string }
) {
  if (process.env.EXPO_OS === "web") {
    return `data:${image.mimeType};base64,${image.base64}`;
  }

  const directory = new Directory(Paths.document, POSTER_PHOTO_DIRECTORY);
  directory.create({ idempotent: true, intermediates: true });
  const extension = image.mimeType.split("/")[1] === "png" ? "png" : "jpg";
  const destination = new File(
    directory,
    `${wishId}-ai-${Date.now()}.${extension}`
  );
  // File#writeのoptions付き呼び出しはExpo Go同梱のネイティブ側が未対応
  // （Received 2 arguments, but 1 was expected）。base64書き込みはlegacy APIを使う。
  // writeAsStringAsyncがファイルも作るのでFile#createは呼ばない
  await writeAsStringAsync(destination.uri, image.base64, {
    encoding: "base64",
  });
  return destination.uri;
}

/** ポスター画像をAIへ渡すためにbase64で読み出す。読めない場合はnull */
export async function readPosterImageAsBase64(
  uri: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    if (uri.startsWith("data:")) {
      const [header, base64] = uri.split(",");
      if (!base64) return null;
      return {
        base64,
        mimeType: header.slice(5).split(";")[0] || "image/jpeg",
      };
    }
    if (process.env.EXPO_OS === "web") return null;

    if (!new File(uri).exists) return null;
    const extension = uri.split(".").pop()?.toLowerCase();
    // 書き込みと同じ理由でlegacy API側を使う（Expo Go同梱のネイティブに合わせる）
    return {
      base64: await readAsStringAsync(uri, { encoding: "base64" }),
      mimeType: extension === "png" ? "image/png" : "image/jpeg",
    };
  } catch (error) {
    if (__DEV__) console.warn("[poster/photo-storage]", error);
    return null;
  }
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
