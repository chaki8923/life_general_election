import type { ReactNode } from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "@/tw/image";
import { Pressable, Text, View } from "@/tw";

/** ピル本体の高さ（Figma: BottomNav 1679:8837 h48） */
export const TAB_BAR_HEIGHT = 48;
/** 各タブの当たり判定＝アクティブ時の丸背景（Figma: 64×64） */
const ITEM_HEIGHT = 64;
/** タブがピル上下からはみ出す量（64 と 48 の差の半分） */
const ITEM_OVERHANG = (ITEM_HEIGHT - TAB_BAR_HEIGHT) / 2;
/** タブ間の間隔（Figma: left 60 / 143 / 225、幅 64 / 63 / 64） */
const ITEM_GAP = 19;
/** セーフエリアが 0 の端末でのバー下端の最低余白 */
const BAR_BOTTOM_GAP = 20;
/** Figma: drop-shadow 0px 2px 4px rgba(51,51,51,0.08) */
const BAR_SHADOW = "0px 2px 4px rgba(51,51,51,0.08)";
/** Figma secondary/700。アクティブ時のアイコン色は白、非アクティブは同色 */
const ICON_ACTIVE = "#ffffff";
const ICON_INACTIVE = "#424a53";

const policyIcon = require("../../../assets/tabbar/policy.svg");
const voteIcon = require("../../../assets/tabbar/vote.svg");
const historyIcon = require("../../../assets/tabbar/history.svg");

/**
 * タブ本文が浮いたフッターに隠れないよう、各画面のスクロール下端に足す余白。
 * 下余白 + ピル高 + タブの上へのはみ出し分。
 */
export function useTabBarBottomPadding(extra = 16) {
  const insets = useSafeAreaInsets();
  return (
    Math.max(insets.bottom, BAR_BOTTOM_GAP) +
    TAB_BAR_HEIGHT +
    ITEM_OVERHANG +
    extra
  );
}

export type FlowTabId = "index" | "vote" | "achievements";

type FlowTabBarProps = {
  active: FlowTabId;
  onPress: (id: FlowTabId) => void;
};

type TabItem = {
  id: FlowTabId;
  icon: number;
  iconWidth: number;
  iconHeight: number;
  label: ReactNode;
  accessibilityLabel: string;
  /** Figma: アイコンとラベルの間隔 */
  gap: number;
  width: number;
};

const TABS: TabItem[] = [
  {
    id: "index",
    icon: policyIcon,
    iconWidth: 24,
    iconHeight: 24,
    // 「約・」だけ詰めて5文字を64px幅に収める
    label: (
      <>
        公<Text className="tracking-[-1.6px]">約・</Text>政策
      </>
    ),
    accessibilityLabel: "公約・政策",
    gap: 1,
    width: 64,
  },
  {
    id: "vote",
    icon: voteIcon,
    iconWidth: 18,
    iconHeight: 19.476,
    label: "選挙する",
    accessibilityLabel: "選挙する",
    gap: 2,
    width: 63,
  },
  {
    id: "achievements",
    icon: historyIcon,
    iconWidth: 24,
    iconHeight: 24,
    label: "過去の履歴",
    accessibilityLabel: "過去の履歴",
    gap: 1,
    width: 64,
  },
];

type TabButtonProps = {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
};

function TabButton({ item, focused, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={item.accessibilityLabel}
      className={`items-center justify-center overflow-hidden rounded-[99px] px-[3px] py-[2px] ${
        focused ? "bg-flow-ink-mid" : ""
      }`}
      style={{ width: item.width, height: ITEM_HEIGHT, gap: item.gap }}
    >
      {/* アイコンは1枚のSVGを塗り分けて使う（アクティブ=白 / 非アクティブ=#424a53） */}
      <Image
        source={item.icon}
        style={{
          width: item.iconWidth,
          height: item.iconHeight,
          tintColor: focused ? ICON_ACTIVE : ICON_INACTIVE,
        }}
        contentFit="contain"
      />
      <Text
        numberOfLines={1}
        className={`font-flow-medium text-[8px] leading-[11.2px] ${
          focused ? "text-white" : "text-flow-ink-low"
        }`}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * フッターメニュー本体（Figma BottomNav 1679:8837）。
 * 角丸ピルに3タブを等間隔で並べ、アクティブなタブだけ上下にはみ出す
 * 濃グレーの丸背景になる。タブ外の画面からも同じ見た目で使える。
 */
export function FlowTabBar({ active, onPress }: FlowTabBarProps) {
  return (
    <View
      className="mx-5"
      style={{ height: ITEM_HEIGHT }}
      pointerEvents="box-none"
    >
      <View
        className="absolute inset-x-0 rounded-[99px] bg-white"
        style={{
          top: ITEM_OVERHANG,
          height: TAB_BAR_HEIGHT,
          boxShadow: BAR_SHADOW,
        }}
      />

      <View
        pointerEvents="box-none"
        className="flex-row items-center justify-center px-5"
        style={{ height: ITEM_HEIGHT, gap: ITEM_GAP }}
      >
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            item={item}
            focused={active === item.id}
            onPress={() => onPress(item.id)}
          />
        ))}
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
 * フッターメニュー（Figma: BottomNav 1679:8837）。
 * 遷移先は index=公約・政策 / vote=選挙する / achievements=過去の履歴。
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
