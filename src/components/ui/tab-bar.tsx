import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "@/tw/image";
import { Pressable, View } from "@/tw";

/** バー本体の高さ（Figma: メニューバー h53） */
export const TAB_BAR_HEIGHT = 53;
/** 中央FABがバー上端からせり上がる量（Figma: バー y1055 に対し FAB y1044） */
const FAB_OVERHANG = 11;
const FAB_SIZE = 61;

const ICONS = {
  index: {
    active: require("../../../assets/tabbar/storage-active.svg"),
    inactive: require("../../../assets/tabbar/storage-inactive.svg"),
    width: 40,
    label: "マイページ",
  },
  achievements: {
    active: require("../../../assets/tabbar/ghost-active.svg"),
    inactive: require("../../../assets/tabbar/ghost-inactive.svg"),
    width: 45,
    label: "実績",
  },
} as const;

const addIcon = require("../../../assets/tabbar/add.svg");

/**
 * タブ本文が中央FABに隠れないよう、各画面のスクロール下端に足す余白。
 * バー高 + セーフエリア + FABのはみ出し分。
 */
export function useTabBarBottomPadding(extra = 16) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + FAB_OVERHANG + extra;
}

type SideTabProps = {
  routeName: keyof typeof ICONS;
  focused: boolean;
  onPress: () => void;
};

function SideTab({ routeName, focused, onPress }: SideTabProps) {
  const icon = ICONS[routeName];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={icon.label}
      hitSlop={12}
      className="h-[53px] flex-1 items-center justify-center"
    >
      <Image
        source={focused ? icon.active : icon.inactive}
        style={{ width: icon.width, height: 40 }}
        contentFit="contain"
      />
    </Pressable>
  );
}

/**
 * フッタータブバー（Figma: メニューバー）。
 * 中央の＋がバー上端をはみ出すため、標準の tabBar ではなくカスタム実装。
 */
export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const go = (routeName: string) => {
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

  return (
    // 画面の上に重ねる。FABのはみ出し分はpaddingTopで内側に取り込み、
    // Androidで親の外にはみ出した子が切れるのを避ける
    <View
      className="absolute inset-x-0 bottom-0"
      style={{ paddingTop: FAB_OVERHANG }}
    >
      <View
        className="border-t border-tab-border bg-white"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="h-[53px] flex-row items-center">
          <SideTab
            routeName="index"
            focused={currentRoute === "index"}
            onPress={() => go("index")}
          />
          {/* 中央FABの footprint（実体は下の absolute 要素） */}
          <View style={{ width: FAB_SIZE }} />
          <SideTab
            routeName="achievements"
            focused={currentRoute === "achievements"}
            onPress={() => go("achievements")}
          />
        </View>
      </View>

      <Pressable
        onPress={() => go("vote")}
        accessibilityRole="button"
        accessibilityState={{ selected: currentRoute === "vote" }}
        accessibilityLabel="総選挙"
        className={`absolute left-1/2 top-0 items-center justify-center rounded-full ${
          currentRoute === "vote" ? "bg-tab-active" : "bg-flow-gray"
        }`}
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          marginLeft: -FAB_SIZE / 2,
          boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
        }}
      >
        <Image
          source={addIcon}
          style={{ width: 40, height: 40 }}
          contentFit="contain"
        />
      </Pressable>
    </View>
  );
}
