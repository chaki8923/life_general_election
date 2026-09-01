import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { AppTabBar } from "@/components/ui/tab-bar";
import { consumeElectionHandoff } from "@/features/onboarding/handoff";

// 起動時の着地は選挙する（vote）。公約・政策へ戻す遷移は / を使う（anchor は index のまま）
export const unstable_settings = {
  anchor: "index",
};

/** セッション中1回だけ、起動時の初期タブを vote に差し替える */
let launchVoteLandingDone = false;

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
      return;
    }
    if (launchVoteLandingDone) return;
    launchVoteLandingDone = true;
    router.replace("/(tabs)/vote");
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
