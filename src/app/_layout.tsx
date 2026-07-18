import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { ensureSignedIn } from "@/services/firebase/auth";
import { useProfileStore } from "@/stores/profile";

// プロフィール復元が終わるまでスプラッシュを維持（オンボーディングのチラつき防止）
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const registered = useProfileStore((s) => s.profile !== null);

  useEffect(() => {
    // 起動時に匿名サインイン（Firebase未設定時はローカルUIDにフォールバック）
    ensureSignedIn().catch((e) => {
      if (__DEV__) console.warn("[auth]", e);
    });
  }, []);

  useEffect(() => {
    if (hasHydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hasHydrated]);

  if (!hasHydrated) return null;

  return (
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
        <Stack.Screen name="election/result" />
        <Stack.Screen name="poster/index" />
      </Stack.Protected>
      <Stack.Protected guard={!registered}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}
