import { useDesignScale } from "@/features/election/layout";
import { View } from "@/tw";
import { Image } from "@/tw/image";
import type { PledgeThemeId } from "@/types";

/** Figma 2317:22264 — happy-pink @4x（256×384） */
const happyPink = require("../../../assets/achievements/history-happy-pink.png");
/** Figma 2317:22321 — happy-blue @4x（256×384） */
const happyBlue = require("../../../assets/achievements/history-happy-blue.png");
/** Figma 2317:22279 — happy-orange @4x（256×384） */
const happyOrange = require("../../../assets/achievements/history-happy-orange.png");
/** Figma 2317:22299 — happy-purple @4x（256×384） */
const happyPurple = require("../../../assets/achievements/history-happy-purple.png");
/** Figma 2317:22343 — happy-green @4x（256×384） */
const happyGreen = require("../../../assets/achievements/history-happy-green.png");

export type HistoryHappyVariant = PledgeThemeId;

/** Figma happy インスタンス共通フレーム */
const HAPPY_CHAR_WIDTH = 72;
const HAPPY_CHAR_HEIGHT = 108;

const HAPPY_SOURCES: Record<HistoryHappyVariant, number> = {
  pink: happyPink,
  blue: happyBlue,
  orange: happyOrange,
  purple: happyPurple,
  green: happyGreen,
};

/**
 * Figma 2317:23408 — 「できた！」カードの達成キャラ。
 * 全色同一サイズで表示。
 */
export function HistoryHappyCharacter({
  variant,
}: {
  variant: HistoryHappyVariant;
}) {
  const { s } = useDesignScale();

  return (
    <View
      className="relative"
      style={{
        width: s(HAPPY_CHAR_WIDTH),
        height: s(HAPPY_CHAR_HEIGHT),
        overflow: "visible",
      }}
      accessibilityLabel="達成キャラクター"
    >
      <Image
        source={HAPPY_SOURCES[variant]}
        style={{
          width: s(HAPPY_CHAR_WIDTH),
          height: s(HAPPY_CHAR_HEIGHT),
        }}
        contentFit="contain"
      />
    </View>
  );
}

/** 投票結果画面で選んだ色のジャンプ達成キャラを「できた！」カードに表示する。 */
export function HistoryDoneCharacter({
  themeId,
}: {
  themeId: PledgeThemeId;
}) {
  return <HistoryHappyCharacter variant={themeId} />;
}
