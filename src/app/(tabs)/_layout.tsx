import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AppTabBar } from "@/components/ui/tab-bar";
import { consumeElectionHandoff } from "@/features/onboarding/handoff";

// 起動時の着地はマイページ（= このグループのindex）
export const unstable_settings = {
  anchor: "index",
};

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    // プロフィール登録直後はそのまま選挙フロー（興味関心）へ直行する。
    // どのタブが最初にマウントされても消費されるようレイアウト側に置く
    if (consumeElectionHandoff()) {
      router.replace({
        pathname: "/election",
        params: { fromProfile: "1" },
      });
    }
  }, [router]);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "マイページ" }} />
      <Tabs.Screen name="vote" options={{ title: "総選挙" }} />
      <Tabs.Screen name="achievements" options={{ title: "実績" }} />
    </Tabs>
  );
}
