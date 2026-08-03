import "../global.css";

import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// パッケージ直下のindexは全ウェイト(1本5MB超)をrequireしてしまうので、必ずサブパスで読む
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSansJP_700Bold } from "@expo-google-fonts/noto-sans-jp/700Bold";
import { font42dotSans_400Regular } from "@expo-google-fonts/42dot-sans/400Regular";
import { font42dotSans_700Bold } from "@expo-google-fonts/42dot-sans/700Bold";
import { ensureSignedIn } from "@/services/firebase/auth";
import { useProfileStore } from "@/stores/profile";

// プロフィール復元が終わるまでスプラッシュを維持（オンボーディングのチラつき防止）
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const registered = useProfileStore((s) => s.profile !== null);
  // 選挙フローの見出し・カウンタはWebフォント前提のレイアウトなので、揃うまで描画しない
  const [fontsLoaded, fontError] = useFonts({
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
    font42dotSans_400Regular,
    font42dotSans_700Bold,
  });
  // Web では Google Fonts の読み込みが完了しないことがあるため、システムフォントで続行する
  const fontsReady =
    Platform.OS === "web" || fontsLoaded || fontError != null;
  // Web では SSR/AsyncStorage 都合で hasHydrated 待ちをスキップする
  const storageReady = Platform.OS === "web" || hasHydrated;
  const appReady = fontsReady && storageReady;

  useEffect(() => {
    // 起動時に匿名サインイン（Firebase未設定時はローカルUIDにフォールバック）
    ensureSignedIn().catch((e) => {
      if (__DEV__) console.warn("[auth]", e);
    });
  }, []);

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) return null;

  return (
    // やる気スライダーのPanジェスチャに必要（Androidでは必須）
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={registered}>
          {/* マイページ／総選挙／実績はフッタータブバー配下 */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="election/index" />
          <Stack.Screen name="election/worries" />
          <Stack.Screen name="election/motivation" />
          <Stack.Screen name="election/counting" />
          <Stack.Screen name="election/result" />
          <Stack.Screen name="poster/index" />
        </Stack.Protected>
        <Stack.Protected guard={!registered}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
