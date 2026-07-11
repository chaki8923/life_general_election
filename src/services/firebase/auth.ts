import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FirebaseAuth from "firebase/auth";
import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import { getFirebaseApp, isFirebaseConfigured } from "./config";

const LOCAL_UID_KEY = "lge:local-uid";

let auth: Auth | null = null;
let cachedUid: string | null = null;

function generateLocalUid(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * プラットフォームに応じたAuthインスタンスを生成する。
 * getReactNativePersistenceはRN向けビルドにのみ存在し（firebase v12でWeb向け
 * エントリから削除）、Webでは未定義になるため実行時に存在確認する。
 */
function createAuth(app: FirebaseApp): Auth {
  if (Platform.OS !== "web") {
    const getRNPersistence = (
      FirebaseAuth as unknown as Record<string, unknown>
    ).getReactNativePersistence as
      | ((storage: typeof AsyncStorage) => unknown)
      | undefined;
    if (getRNPersistence) {
      return initializeAuth(app, {
        persistence: getRNPersistence(AsyncStorage) as never,
      });
    }
  }
  // Web: getAuthのデフォルト永続化（IndexedDB）でUIDがリロード後も維持される
  return getAuth(app);
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
      auth = createAuth(app);
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
