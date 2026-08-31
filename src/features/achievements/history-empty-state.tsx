import { FONT, useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";

/** Figma 2317:23485 書き出し（オレンジ固定） */
const cryCharacter = require("../../../assets/achievements/history-empty-cry-figma.png");

/** Figma 2317:23484 — 文言ブロック幅 */
const MESSAGE_WIDTH = 252;
/** Figma character/3/bold-pro */
const MESSAGE_FONT_SIZE = 16;
const MESSAGE_LINE_HEIGHT = 24;
const MESSAGE_LETTER_SPACING = 0.8;
/** Figma 2317:23485 — 表示サイズ */
const CHAR_WIDTH = 64;
const CHAR_HEIGHT = 96;
/** Figma 2317:23483 — 文言とキャラの間隔 */
const MESSAGE_TO_CHAR_GAP = 20;

/**
 * Figma 2317:23483 — 政策未達成ユーザー向けの空状態。
 */
export function HistoryEmptyState() {
  const { s } = useDesignScale();

  return (
    <View
      className="w-full items-center"
      accessibilityRole="text"
      accessibilityLabel="まだ達成したものはないみたい… 政策を頑張ろう！"
    >
      <View className="items-center" style={{ gap: s(MESSAGE_TO_CHAR_GAP) }}>
        <Text
          className="text-center text-flow-ink"
          style={{
            fontFamily: FONT.bold,
            fontSize: s(MESSAGE_FONT_SIZE),
            lineHeight: s(MESSAGE_LINE_HEIGHT),
            letterSpacing: s(MESSAGE_LETTER_SPACING),
            maxWidth: s(MESSAGE_WIDTH),
          }}
        >
          {"まだ達成したものはないみたい…\n政策を頑張ろう！"}
        </Text>
        <Image
          source={cryCharacter}
          style={{
            width: s(CHAR_WIDTH),
            height: s(CHAR_HEIGHT),
          }}
          contentFit="contain"
          accessibilityLabel="泣いているキャラクター"
        />
      </View>
    </View>
  );
}
