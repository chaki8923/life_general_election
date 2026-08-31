import { Image, type ImageLoadOptions, type ImageRef } from "expo-image";

/**
 * デコード済みの参照を持ち続ける。
 * 参照を捨てるとネイティブ側のリソースが解放され、温めたキャッシュごと消えてしまう。
 */
const loaded = new Map<number, ImageRef>();
/** 同じ画像を並行して二重に読まないための進行中タスク */
const inflight = new Map<number, Promise<void>>();

function preloadOne(module: number, options?: ImageLoadOptions): Promise<void> {
  if (loaded.has(module)) return Promise.resolve();

  const running = inflight.get(module);
  if (running) return running;

  const task = Image.loadAsync(module, options)
    .then((ref) => {
      loaded.set(module, ref);
    })
    // 先読みが失敗しても表示側がrequireで読み直せるので、機能は壊れない
    .catch((e) => {
      if (__DEV__) console.warn("[image-preload]", e);
    })
    .finally(() => {
      inflight.delete(module);
    });

  inflight.set(module, task);
  return task;
}

/**
 * require()で解決済みの画像をまとめてメモリへ載せる。
 * 動画を先に用意しておく BackgroundVideoProvider と同じねらい。
 */
export function preloadImages(
  modules: number[],
  options?: ImageLoadOptions
): Promise<void> {
  return Promise.all(modules.map((m) => preloadOne(m, options))).then(
    () => undefined
  );
}

/** 先読み済みか（検証・デバッグ用） */
export function isPreloaded(module: number): boolean {
  return loaded.has(module);
}
