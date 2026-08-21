import type { ReactNode } from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";

/** ピル本体の高さ（Figma: manu 502-2760 h48） */
export const TAB_BAR_HEIGHT = 48;
/** 中央の投票ボタン（Figma: 56×56 の円） */
const FAB_SIZE = 56;
/** FAB がピル上下からはみ出す量（56 と 48 の差の半分） */
const FAB_OVERHANG = (FAB_SIZE - TAB_BAR_HEIGHT) / 2;
/** セーフエリアが 0 の端末でのバー下端の最低余白 */
const BAR_BOTTOM_GAP = 20;
/** Figma: drop-shadow 0px 2px 4px rgba(51,51,51,0.08) */
const BAR_SHADOW = "0px 2px 4px rgba(51,51,51,0.08)";
/** FlowStepper と同じインク黒 */
const TAB_INK = "#24292f";
/** 黒背景上の表示色（投票 FAB など） */
const TAB_ON_DARK = "#f6f8fa";

const policyIcon = require("../../../assets/tabbar/policy.svg");
const voteIcon = require("../../../assets/tabbar/vote.svg");
const historyIcon = require("../../../assets/tabbar/history.svg");

/**
 * タブ本文が浮いたフッターに隠れないよう、各画面のスクロール下端に足す余白。
 * 下余白 + ピル高 + FAB の上へのはみ出し分。
 */
export function useTabBarBottomPadding(extra = 16) {
  const insets = useSafeAreaInsets();
  return (
    Math.max(insets.bottom, BAR_BOTTOM_GAP) +
    TAB_BAR_HEIGHT +
    FAB_OVERHANG +
    extra
  );
}

export type FlowTabId = "index" | "vote" | "achievements";

type FlowTabBarProps = {
  active: FlowTabId;
  onPress: (id: FlowTabId) => void;
};

type SideTabProps = {
  icon: number;
  label: ReactNode;
  accessibilityLabel: string;
  focused: boolean;
  onPress: () => void;
};

function SideTab({
  icon,
  label,
  accessibilityLabel,
  focused,
  onPress,
}: SideTabProps) {
  const ink = focused ? TAB_ON_DARK : TAB_INK;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className="items-center justify-center gap-0.5 overflow-hidden rounded-[99px]"
      style={{
        width: FAB_SIZE,
        height: FAB_SIZE,
        backgroundColor: focused ? TAB_INK : "transparent",
      }}
    >
      <Image
        source={icon}
        style={{ width: 24, height: 24, tintColor: ink }}
        contentFit="contain"
      />
      <Text
        numberOfLines={1}
        className="font-flow-medium text-[8px] leading-[11.2px]"
        style={{ color: ink }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * フッターメニュー本体（Figma BottomNav 1679:8798 / manu 502-2760）。
 * 角丸ピル + 中央の投票 FAB。タブ外の画面からも同じ見た目で使える。
 */
export function FlowTabBar({ active, onPress }: FlowTabBarProps) {
  const voteFocused = active === "vote";
  const voteInk = voteFocused ? TAB_ON_DARK : TAB_INK;

  return (
    <View className="mx-5 h-[56px]" pointerEvents="box-none">
      <View
        className="absolute inset-x-0 rounded-[99px] bg-white"
        style={{
          top: FAB_OVERHANG,
          height: TAB_BAR_HEIGHT,
          boxShadow: BAR_SHADOW,
        }}
      />

      <View
        pointerEvents="box-none"
        className="h-[56px] flex-row items-center justify-center gap-10 px-5"
      >
        <SideTab
          icon={policyIcon}
          label={
            <>
              公<Text className="tracking-[-1.6px]">約・</Text>政策
            </>
          }
          accessibilityLabel="公約・政策"
          focused={active === "index"}
          onPress={() => onPress("index")}
        />

        <Pressable
          onPress={() => onPress("vote")}
          accessibilityRole="button"
          accessibilityState={{ selected: voteFocused }}
          accessibilityLabel="投票する"
          className="items-center justify-center gap-0.5 overflow-hidden rounded-[99px]"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            backgroundColor: voteFocused ? TAB_INK : "transparent",
          }}
        >
          <Image
            source={voteIcon}
            style={{ width: 18, height: 19.476, tintColor: voteInk }}
            contentFit="contain"
          />
          <Text
            numberOfLines={1}
            className="font-flow-medium text-[8px] leading-[11.2px]"
            style={{ color: voteInk }}
          >
            投票する
          </Text>
        </Pressable>

        <SideTab
          icon={historyIcon}
          label="過去の履歴"
          accessibilityLabel="過去の履歴"
          focused={active === "achievements"}
          onPress={() => onPress("achievements")}
        />
      </View>
    </View>
  );
}

/** 画面下に重ねる BottomNav（セーフエリア込み） */
export function FlowTabBarOverlay(props: FlowTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0"
      style={{ paddingBottom: Math.max(insets.bottom, BAR_BOTTOM_GAP) }}
    >
      <FlowTabBar {...props} />
    </View>
  );
}

/**
 * フッターメニュー（Figma: manu 502-2760）。
 * 画面から浮いた角丸ピルに、中央の投票ボタンが上下へはみ出す形。
 * 遷移先は index=公約・政策 / vote=投票する / achievements=過去の履歴。
 */
export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const go = (routeName: FlowTabId) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const isFocused = state.routes[state.index]?.name === routeName;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const currentRoute = state.routes[state.index]?.name;
  const active: FlowTabId =
    currentRoute === "vote" || currentRoute === "achievements"
      ? currentRoute
      : "index";

  return <FlowTabBarOverlay active={active} onPress={go} />;
}
