import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router/stack";
import { ensureSignedIn } from "@/services/firebase/auth";

export default function RootLayout() {
  useEffect(() => {
    // 起動時に匿名サインイン（Firebase未設定時はローカルUIDにフォールバック）
    ensureSignedIn().catch((e) => {
      if (__DEV__) console.warn("[auth]", e);
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
