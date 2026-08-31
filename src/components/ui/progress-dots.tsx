import { View } from "@/tw";

/** Figma progress-step 1012:3606 / 2665:19041 */
const DOT_ACTIVE = "#24292f";
const DOT_INACTIVE = "#afb8c1";

type ProgressDotsProps = {
  total?: number;
  current?: number;
  /** ドット直径。Figmaは画面によって8px（マイページ等）と6px（チュートリアル）がある */
  size?: number;
  gap?: number;
};

/**
 * ページドット（Figma progress-bar-step4）。
 * 開票結果のカルーセル・マイページ・ガイドモーダルで共通に使う。
 */
export function ProgressDots({
  total = 2,
  current = 0,
  size = 8,
  gap = 12,
}: ProgressDotsProps) {
  return (
    // rem が 14px のプロジェクトなので、Figma 実測値は px で書く
    <View
      className="w-full flex-row items-center justify-center px-[16px] py-[8px]"
      style={{ gap }}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: index === current ? DOT_ACTIVE : DOT_INACTIVE,
          }}
        />
      ))}
    </View>
  );
}
