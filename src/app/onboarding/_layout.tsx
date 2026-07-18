import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 登録途中にスワイプバックでチュートリアルへ戻れないようにする
        gestureEnabled: false,
      }}
    />
  );
}
