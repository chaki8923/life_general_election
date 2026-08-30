import { useDesignScale } from "@/features/election/layout";
import { View } from "@/tw";
import { Image } from "@/tw/image";
import type { PledgeThemeId } from "@/types";

/** Figma 2317:22058 — sad-pink @4x（256×384） */
const sadPink = require("../../../assets/achievements/history-sad-pink.png");
/** Figma 2317:22039 — sad-orange @4x（256×384） */
const sadOrange = require("../../../assets/achievements/history-sad-orange.png");
/** Figma 2317:22080 — sad-purple @4x（256×384） */
const sadPurple = require("../../../assets/achievements/history-sad-purple.png");
/** Figma 2317:22102 — sad-green @4x（256×384） */
const sadGreen = require("../../../assets/achievements/history-sad-green.png");
/** Figma 2317:22124 — sad-blue @4x（256×384） */
const sadBlue = require("../../../assets/achievements/history-sad-blue.png");

/** Figma sad インスタンス共通フレーム（64×96） */
const SAD_CHAR_WIDTH = 66;
const SAD_CHAR_HEIGHT = 99;

const SAD_SOURCES: Record<PledgeThemeId, number> = {
  pink: sadPink,
  orange: sadOrange,
  purple: sadPurple,
  green: sadGreen,
  blue: sadBlue,
};

/**
 * Figma 2317:22134 — 「できなかった」カードのキャラ。
 * 投票結果で選んだ色の sad バリアントを 64×96 で表示。
 */
export function HistorySadCharacter({
  themeId,
}: {
  themeId: PledgeThemeId;
}) {
  const { s } = useDesignScale();

  return (
    <View
      className="relative shrink-0"
      style={{
        width: s(SAD_CHAR_WIDTH),
        height: s(SAD_CHAR_HEIGHT),
      }}
      accessibilityLabel="できなかったキャラクター"
    >
      <Image
        source={SAD_SOURCES[themeId]}
        style={{
          width: s(SAD_CHAR_WIDTH),
          height: s(SAD_CHAR_HEIGHT),
        }}
        contentFit="contain"
      />
    </View>
  );
}
