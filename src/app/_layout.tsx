import "../global.css";

import { useEffect } from "react";
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
  // フォント取得に失敗してもシステムフォントで続行する（起動不能にしない）
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    // 起動時に匿名サインイン（Firebase未設定時はローカルUIDにフォールバック）
    ensureSignedIn().catch((e) => {
      if (__DEV__) console.warn("[auth]", e);
    });
  }, []);

  useEffect(() => {
    if (hasHydrated && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [hasHydrated, fontsReady]);

  if (!hasHydrated || !fontsReady) return null;

  return (
    // やる気スライダーのPanジェスチャに必要（Androidでは必須）
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Protected guard={registered}>
          <Stack.Screen name="index" />
          <Stack.Screen name="election/index" />
          <Stack.Screen name="election/worries" />
          <Stack.Screen name="election/motivation" />
          <Stack.Screen name="election/counting" />
          <Stack.Screen name="election/result" />
          <Stack.Screen name="mypage" />
          <Stack.Screen name="achievements" />
          <Stack.Screen name="poster/index" />
        </Stack.Protected>
        <Stack.Protected guard={!registered}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
