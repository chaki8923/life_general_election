import { useDesignScale } from "@/features/election/layout";
import { View } from "@/tw";
import { Image } from "@/tw/image";
import type { ImageContentFit } from "expo-image";

/** Figma 2317:22007 — pink @4x（256×384、キラキラ込み） */
const happyPink = require("../../../assets/achievements/history-happy-pink.png");
/** Figma 2317:22003 — blue @2x（148×192） */
const happyBlue = require("../../../assets/achievements/history-happy-blue.png");

export type HistoryHappyVariant = "pink" | "blue";

type VariantMeta = {
  source: number;
  width: number;
  height: number;
  contentFit: ImageContentFit;
};

/**
 * Figma 2317:23408 — 「できた！」カードの達成キャラ。
 * 表示サイズは Figma フレーム寸法を s() でスケール。
 */
const VARIANT_META: Record<HistoryHappyVariant, VariantMeta> = {
  pink: { source: happyPink, width: 64, height: 96, contentFit: "contain" },
  blue: { source: happyBlue, width: 74, height: 96, contentFit: "contain" },
};

export function HistoryHappyCharacter({
  variant,
}: {
  variant: HistoryHappyVariant;
}) {
  const { s } = useDesignScale();
  const meta = VARIANT_META[variant];

  return (
    <View
      className="relative"
      style={{
        width: s(meta.width),
        height: s(meta.height),
        overflow: "visible",
      }}
      accessibilityLabel="達成キャラクター"
    >
      <Image
        source={meta.source}
        style={{ width: s(meta.width), height: s(meta.height) }}
        contentFit={meta.contentFit}
      />
    </View>
  );
}
