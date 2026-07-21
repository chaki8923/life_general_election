import AsyncStorage from "@react-native-async-storage/async-storage";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";

/**
 * 開発用: ローカル永続データと全ストアを初期状態に戻す。
 * オンボーディング（チュートリアル→プロフィール登録）を最初からやり直せる。
 */
export async function resetAppData() {
  await AsyncStorage.multiRemove([
    "lge-profile",
    "lge-wishes",
    "lge:local-uid",
  ]);
  useWishStore.setState({ wishes: [] });
  useElectionStore.setState({
    interest: null,
    worryCandidates: null,
    worry: null,
    motivation: null,
    election: null,
  });
  // 最後にprofileを消すとStack.Protectedガードが反転し、即オンボーディングへ切り替わる
  useProfileStore.setState({ profile: null, tutorialSeen: false });
}
