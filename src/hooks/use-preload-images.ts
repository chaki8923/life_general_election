import { useEffect } from "react";
import type { ImageLoadOptions } from "expo-image";
import { preloadImages } from "@/features/media/image-preload";

/**
 * 「次の画面で必要になる画像」を宣言して先読みする。
 * 表示側のsourceはrequireのままでよく、ネイティブのキャッシュにヒットして表示が早くなる。
 */
export function usePreloadImages(
  modules: number[],
  options?: ImageLoadOptions
): void {
  // モジュールIDは数値なので、配列の中身が同じなら再実行しない
  const key = modules.join(",");

  useEffect(() => {
    preloadImages(modules, options);
    // keyが同じなら中身も同じ。modules/optionsの参照差では再実行しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
