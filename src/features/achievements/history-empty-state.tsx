import { FONT, useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";

/** Figma 2317:23485 書き出し（目の形・ハイライトがデザイン準拠） */
const cryCharacter = require("../../../assets/achievements/history-empty-cry-figma.png");

const ASSET_W = 247;
const ASSET_H = 355;
/** Figma 2317:23485 表示幅 */
const CHAR_W = 62;
const GAP = 20;
const IMAGE_BOTTOM_PAD = 24;
/**
 * Figma 2317:23483 — 政策未達成ユーザー向けの空状態。
 */
export function HistoryEmptyState() {
  const { s } = useDesignScale();

  return (
    <View
      className="w-full items-center px-5"
      accessibilityRole="text"
      accessibilityLabel="まだ達成したものはないみたい… 政策を頑張ろう！"
    >
      <View className="items-center" style={{ gap: s(GAP) }}>
        <Text
          className="text-center text-flow-ink"
          style={{
            fontFamily: FONT.bold,
            fontSize: s(16),
            lineHeight: s(24),
            letterSpacing: 0.8,
          }}
        >
          {"まだ達成したものはないみたい…\n政策を頑張ろう！"}
        </Text>
        <View style={{ paddingBottom: s(IMAGE_BOTTOM_PAD) }}>
          <Image
            source={cryCharacter}
            style={{
              width: s(CHAR_W),
              aspectRatio: ASSET_W / ASSET_H,
            }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}
