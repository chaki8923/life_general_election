import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

// allowsEditing + aspect 3:4 でユーザー自身に切り抜かせることで、
// cover配置での顔位置ズレを防ぐ(aspectはAndroidのみ有効。iOSは正方形クロップ)
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 1,
};

/** ポスター用の写真をフォトライブラリ/カメラから取得するフック */
export function usePosterPhoto(onPicked: (uri: string) => void) {
  const pickFromLibrary = async () => {
    try {
      // PHPicker / Photo Picker のため事前パーミッション不要
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (!result.canceled) onPicked(result.assets[0].uri);
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
      if (!result.canceled) onPicked(result.assets[0].uri);
    } catch (e) {
      if (__DEV__) console.warn("[poster/photo]", e);
      Alert.alert("撮影に失敗しました…");
    }
  };

  return { pickFromLibrary, takePhoto };
}
