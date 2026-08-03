import { Redirect } from "expo-router";
import { useProfileStore } from "@/stores/profile";

export default function Index() {
  const profile = useProfileStore((s) => s.profile);
  if (profile) return <Redirect href="/(tabs)" />;
  return <Redirect href="/onboarding" />;
}
