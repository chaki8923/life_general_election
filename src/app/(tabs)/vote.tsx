import { useRouter } from "expo-router";
import { useTabBarBottomPadding } from "@/components/ui/tab-bar";
import { ElectionStartScreen } from "@/features/election/election-start-screen";

/** 総選挙トップ（Figma: TOP 2070:7821） */
export default function VoteScreen() {
  const router = useRouter();
  const bottomPadding = useTabBarBottomPadding();

  return (
    <ElectionStartScreen
      bottomPadding={bottomPadding}
      onStart={() => router.push("/election")}
    />
  );
}
