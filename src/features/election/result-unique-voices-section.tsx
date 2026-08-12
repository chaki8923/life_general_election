import { Text, View } from "@/tw";
import { Image } from "@/tw/image";

const crowdBg = require("../../../assets/election/result/unique-voices-crowd-bg.png");
const crowdRight = require("../../../assets/election/result/unique-voices-crowd-right.png");

/** Figma 1905:13968 — Group 624883 */
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
  return (
    <View className="items-center gap-2.5">
      <Text className="w-full text-center font-flow-medium text-base leading-[1.4] text-flow-ink">
        そのほかにもユニークな声が集まったよ！
      </Text>

      <View
        style={{ width: CROWD_WIDTH, height: CROWD_HEIGHT }}
        accessibilityLabel="ユニークな声のキャラクター"
      >
        {/* 1905:13970 — 左4体 + 背景（608×147 ソース） */}
        <View
          className="absolute left-0 top-0 overflow-hidden"
          style={{ width: BG_WIDTH, height: BG_HEIGHT }}
        >
          <Image
            source={crowdBg}
            className="absolute top-0"
            style={{
              height: BG_HEIGHT,
              width: BG_WIDTH * 1.5007,
              left: -(BG_WIDTH * 0.2221),
            }}
            contentFit="cover"
          />
        </View>

        {/* 1905:13969 — 右端ライトブルー（105×130 ソース → 51×63 表示） */}
        <Image
          source={crowdRight}
          className="absolute"
          style={{
            left: RIGHT_X,
            top: RIGHT_Y,
            width: RIGHT_WIDTH,
            height: RIGHT_HEIGHT,
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}
