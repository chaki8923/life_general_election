import { Redirect } from "expo-router";
import { TutorialPager } from "@/features/onboarding/tutorial-pager";
import { useProfileStore } from "@/stores/profile";

export default function TutorialScreen() {
  // チュートリアル済み・プロフィール未登録のまま再起動した場合は登録から再開
  const tutorialSeen = useProfileStore((s) => s.tutorialSeen);
  if (tutorialSeen) return <Redirect href="/onboarding/profile" />;
  return <TutorialPager />;
}
