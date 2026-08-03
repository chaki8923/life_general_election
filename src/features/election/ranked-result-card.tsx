import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";
import type { Candidate } from "@/types";
import {
  RANK_THEMES,
  type ResultCardTheme,
  type ResultRank,
} from "./result-theme";
import { VoteIconGrid } from "./vote-icon-grid";

const characterImage = require("../../../assets/poster/default-character.png");

type RankedResultCardProps = {
  rank: ResultRank;
  candidate: Candidate;
  onProceed: () => void;
};

function PolicyTag({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full border border-flow-ink-low/30 px-2.5 py-0.5">
      <Text className="font-flow-medium text-[10px] text-flow-ink-mid">
        {label}
      </Text>
    </View>
  );
}

export function RankedResultCard({
  rank,
  candidate,
  onProceed,
}: RankedResultCardProps) {
  const theme = RANK_THEMES[rank];

  return (
    <ResultCardBody
      theme={theme}
      rankLabel={`#${rank}`}
      candidate={candidate}
      onProceed={onProceed}
    />
  );
}

type ResultCardBodyProps = {
  theme: ResultCardTheme;
  rankLabel?: string;
  candidate: Candidate;
  onProceed: () => void;
  compact?: boolean;
};

export function ResultCardBody({
  theme,
  rankLabel,
  candidate,
  onProceed,
  compact = false,
}: ResultCardBodyProps) {
  return (
    <View
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ${
        compact ? "w-[300px]" : ""
      }`}
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <View className="flex-row">
        {rankLabel ? (
          <View
            className={`items-center justify-center px-2 ${theme.accentBg}`}
            style={{ minWidth: 36 }}
          >
            <Text className="text-base">👑</Text>
            <Text className="font-flow text-xs text-white">{rankLabel}</Text>
          </View>
        ) : null}

        <View className="flex-1 p-4">
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: `${theme.accent}22` }}
            >
              <Image
                source={characterImage}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
            </View>
            <View className="flex-1">
              <VoteIconGrid color={theme.voteFill} />
              <Text className="mt-1 font-flow-medium text-[11px] text-flow-ink-mid">
                <Text className="font-flow text-sm text-flow-ink">
                  {candidate.votes}人
                </Text>
                が選んだよ
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <View>
              <PolicyTag label="人生公約" />
              <Text className="mt-2 font-flow text-lg leading-7 text-flow-ink">
                {candidate.label}
              </Text>
            </View>
            <View>
              <PolicyTag label="📋 掲げる政策" />
              <Text className="mt-2 font-flow-medium text-sm leading-6 text-flow-ink">
                {candidate.action}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onProceed}
            accessibilityRole="button"
            accessibilityLabel="この公約と政策で進める"
            className={`mt-4 h-12 items-center justify-center rounded-full ${theme.buttonBg} active:opacity-80`}
          >
            <Text className="font-flow text-sm tracking-wide text-white">
              この公約と政策で進める
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
