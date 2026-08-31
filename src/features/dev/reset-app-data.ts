import AsyncStorage from "@react-native-async-storage/async-storage";
import { useElectionStore } from "@/stores/election";
import { useProfileStore } from "@/stores/profile";
import { useWishStore } from "@/stores/wishes";

/**
 * 開発用: ローカル永続データと全ストアを初期状態に戻す。
 * 未登録の開始画面からプロフィール登録をやり直せる。
 */
export async function resetAppData() {
  await AsyncStorage.multiRemove([
    "lge-profile",
    "lge-wishes",
    "lge-election-history",
    "lge:local-uid",
  ]);
  useWishStore.setState({ wishes: [] });
  useElectionStore.setState({
    interest: null,
    worryCandidates: null,
    worry: null,
    motivation: null,
    election: null,
    showProfileStep: false,
    history: {},
  });
  // 最後にprofileを消すとStack.Protectedのガードが反転し、オンボーディングへ切り替わる
  useProfileStore.setState({
    profile: null,
    tutorialSeen: false,
    mypageGuideSeen: false,
  });
}
