import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import type { PickedPosterImage } from "./photo-storage";

// allowsEditing + aspect 3:4 でユーザー自身に切り抜かせることで、
// cover配置での顔位置ズレを防ぐ(aspectはAndroidのみ有効。iOSは正方形クロップ)
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.82,
  base64: process.env.EXPO_OS === "web",
};

/** ポスター用の写真をフォトライブラリ/カメラから取得するフック */
export function usePosterPhoto(
  onPicked: (asset: PickedPosterImage) => void | Promise<void>
) {
  const pickFromLibrary = async () => {
    try {
      // allowsEditing の間は PHPicker ではなくレガシーの UIImagePickerController /
      // Photo Picker 経路になる。どちらも事前パーミッションの要求は不要
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (result.canceled) {
        // ユーザーのキャンセルと、ネイティブ側の握り潰し（モーダル競合など）を
        // 切り分けられるようにログだけ残す
        if (__DEV__) console.warn("[poster/photo] library canceled");
        return;
      }
      await onPicked(result.assets[0]);
    } catch (e) {
      if (__DEV__) console.warn("[poster/photo]", e);
      Alert.alert("写真を読み込めませんでした…");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            "カメラを使えません",
            "設定アプリからカメラの使用を許可してください。",
            [
              { text: "キャンセル", style: "cancel" },
              { text: "設定を開く", onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert("カメラの使用許可が必要です");
        }
        return;
      }
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      if (result.canceled) {
        if (__DEV__) console.warn("[poster/photo] camera canceled");
        return;
      }
      await onPicked(result.assets[0]);
    } catch (e) {
      if (__DEV__) console.warn("[poster/photo]", e);
      Alert.alert("撮影に失敗しました…");
    }
  };

  return { pickFromLibrary, takePhoto };
}
