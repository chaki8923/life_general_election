import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ElectionStartScreen } from "@/features/election/election-start-screen";

const BOTTOM_GAP = 24;

export default function OnboardingStartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ElectionStartScreen
      bottomPadding={insets.bottom + BOTTOM_GAP}
      onStart={() => router.replace("/onboarding/profile")}
    />
  );
}
