import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  signInAnonymously,
  // @ts-expect-error: React Native向けエントリポイントにのみ存在（型定義に含まれない）
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { getFirebaseApp, isFirebaseConfigured } from "./config";

const LOCAL_UID_KEY = "lge:local-uid";

let auth: Auth | null = null;
let cachedUid: string | null = null;

function generateLocalUid(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 匿名認証でサインインしてUIDを返す。
 * Firebase未設定の場合は端末ローカルのUIDを発行して永続化する
 * （どちらの場合も「端末を変えたら別ユーザー」という要件どおりの挙動になる）。
 */
export async function ensureSignedIn(): Promise<string> {
  if (cachedUid) return cachedUid;

  if (isFirebaseConfigured) {
    const app = getFirebaseApp()!;
    if (!auth) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
    if (auth.currentUser) {
      cachedUid = auth.currentUser.uid;
      return cachedUid;
    }
    const cred = await signInAnonymously(auth);
    cachedUid = cred.user.uid;
    return cachedUid;
  }

  // ローカルフォールバック
  let uid = await AsyncStorage.getItem(LOCAL_UID_KEY);
  if (!uid) {
    uid = generateLocalUid();
    await AsyncStorage.setItem(LOCAL_UID_KEY, uid);
  }
  cachedUid = uid;
  return uid;
}

export function getCurrentUid(): string | null {
  return cachedUid;
}
