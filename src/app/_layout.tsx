import "../global.css";

import { useEffect, useState } from "react";
import { isRunningInExpoGo } from "expo";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// パッケージ直下のindexは全ウェイト(1本5MB超)をrequireしてしまうので、必ずサブパスで読む
import { NotoSansJP_400Regular } from "@expo-google-fonts/noto-sans-jp/400Regular";
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSansJP_700Bold } from "@expo-google-fonts/noto-sans-jp/700Bold";
import { font42dotSans_400Regular } from "@expo-google-fonts/42dot-sans/400Regular";
import { font42dotSans_700Bold } from "@expo-google-fonts/42dot-sans/700Bold";
import { BackgroundVideoProvider } from "@/hooks/use-background-video";
import { ensureSignedIn } from "@/services/firebase/auth";
import { useProfileStore } from "@/stores/profile";

// アリーナ背景。Androidのネイティブスプラッシュは全画面画像を出せない(OSが単色+中央アイコンに固定する)ので、
// ネイティブスプラッシュを外したあとJS側で同じ絵を敷き、両OSで同じ見た目にする。
const splashBackground = require("../../assets/images/splash-bg.png");

// フォントはバンドル同梱、プロフィールもAsyncStorageなので復元は数十msで終わる。
// そのままだとスプラッシュが1フレームで消えてしまうので、最低表示時間を設ける。
const SPLASH_MIN_DURATION_MS = 1200;

// プロフィール復元が終わるまでスプラッシュを維持（オンボーディングのチラつき防止）
SplashScreen.preventAutoHideAsync().catch(() => {});
// ネイティブスプラッシュからJS側の背景へ切り替わる瞬間を目立たせない。
// Expo Goでは呼ぶだけで警告が出るうえ効果もないので避ける
// （ネイティブスプラッシュ自体、SDK52以降のExpo Goでは再現されずアプリアイコンが出る）。
if (!isRunningInExpoGo()) {
  SplashScreen.setOptions({ duration: 250, fade: true });
}

export default function RootLayout() {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const registered = useProfileStore((s) => s.profile !== null);
  // 選挙フローの見出し・カウンタはWebフォント前提のレイアウトなので、揃うまで描画しない
  const [fontsLoaded, fontError] = useFonts({
    NotoSansJP_400Regular,
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

  const [splashImageLoaded, setSplashImageLoaded] = useState(false);
  const [minDurationPassed, setMinDurationPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setMinDurationPassed(true),
      SPLASH_MIN_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, []);

  const appReady = hasHydrated && fontsReady && minDurationPassed;

  useEffect(() => {
    // 背景画像が描けた時点でネイティブスプラッシュを外し、下のJS側の背景に引き継ぐ。
    // 画像が読めなかった場合もappReadyで必ず外し、スプラッシュに閉じ込められないようにする。
    if (splashImageLoaded || appReady) SplashScreen.hideAsync().catch(() => {});
  }, [splashImageLoaded, appReady]);

  return (
    // フォントやプロフィールの復元中も動画のバッファ準備は先行させる。
    <BackgroundVideoProvider>
      {appReady ? (
        // やる気スライダーのPanジェスチャに必要（Androidでは必須）
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Protected guard={registered}>
              {/* マイページ／総選挙／実績はフッタータブバー配下 */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="election/index" />
              <Stack.Screen name="election/worries" />
              <Stack.Screen name="election/motivation" />
              <Stack.Screen name="election/counting" />
              <Stack.Screen name="election/result" />
            </Stack.Protected>
            <Stack.Protected guard={!registered}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
          </Stack>
        </GestureHandlerRootView>
      ) : (
        // 準備中の画面。backgroundColorはネイティブスプラッシュと同じ地色で、
        // 画像がデコードされる前の一瞬にも継ぎ目が出ないようにする。
        <Image
          source={splashBackground}
          style={{ flex: 1, backgroundColor: "#000628" }}
          contentFit="cover"
          transition={0}
          onLoadEnd={() => setSplashImageLoaded(true)}
        />
      )}
    </BackgroundVideoProvider>
  );
}
