import { useDesignScale } from "@/features/election/layout";
import { Text, View } from "@/tw";
import { Image } from "@/tw/image";

const crowdBg = require("../../../assets/election/result/unique-voices-crowd-bg.webp");
const crowdRight = require("../../../assets/election/result/unique-voices-crowd-right.webp");

/** Figma 1905:13968 — Group 624883（デザインpx） */
const CROWD_WIDTH = 251;
const CROWD_HEIGHT = 76;
/** 1905:13970 背景 */
const BG_WIDTH = 210;
const BG_HEIGHT = 76;
/** 1905:13969 右端キャラ（グループ内 x≈200, y≈13） */
const RIGHT_X = 200;
const RIGHT_Y = 13;
const RIGHT_WIDTH = 51;
const RIGHT_HEIGHT = 63;

/**
 * 「そのほかにもユニークな声が…」見出し + キャラ5体（Figma 1691:2848 + 1905:13968）
 * マイノリティ公約カード直上に配置する。
 */
export function ResultUniqueVoicesSection() {
  const { s } = useDesignScale();
  const crowdW = s(CROWD_WIDTH);
  const crowdH = s(CROWD_HEIGHT);
  const bgW = s(BG_WIDTH);
  const bgH = s(BG_HEIGHT);

  return (
    <View className="w-full items-center" style={{ gap: s(10) }}>
      <Text
        className="w-full text-center font-flow-medium text-flow-ink"
        style={{ fontSize: s(16), lineHeight: s(16 * 1.4) }}
      >
        そのほかにもユニークな声が集まったよ！
      </Text>

      <View
        className="max-w-full self-center overflow-hidden"
        style={{ width: crowdW, height: crowdH }}
        accessibilityLabel="ユニークな声のキャラクター"
      >
        {/* 1905:13970 — 左4体 + 背景（608×147 ソース） */}
        <View
          className="absolute left-0 top-0 overflow-hidden"
          style={{ width: bgW, height: bgH }}
        >
          <Image
            source={crowdBg}
            className="absolute top-0"
            style={{
              height: bgH,
              width: bgW * 1.5007,
              left: -(bgW * 0.2221),
            }}
            contentFit="cover"
          />
        </View>

        {/* 1905:13969 — 右端ライトブルー（105×130 ソース → 51×63 表示） */}
        <Image
          source={crowdRight}
          className="absolute"
          style={{
            left: s(RIGHT_X),
            top: s(RIGHT_Y),
            width: s(RIGHT_WIDTH),
            height: s(RIGHT_HEIGHT),
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}
