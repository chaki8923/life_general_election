import { useState, type RefObject } from "react";
import { Alert, Linking, type View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "./templates";

/** ポスターViewをキャプチャして保存/シェアするフック */
export function usePosterExport(posterRef: RefObject<View | null>) {
  const [busy, setBusy] = useState(false);

  // tmpfileならSharing.shareAsyncとsaveToLibraryAsyncにそのまま渡せる。
  // width/height指定で表示サイズに関係なく1080x1440の高解像度出力になる
  const capture = () =>
    captureRef(posterRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: CAPTURE_WIDTH,
      height: CAPTURE_HEIGHT,
    });

  const share = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("この端末ではシェアできません");
        return;
      }
      const uri = await capture();
      await Sharing.shareAsync(uri, { mimeType: "image/png" });
    } catch (e) {
      if (__DEV__) console.warn("[poster/export]", e);
      Alert.alert("シェアに失敗しました…");
    } finally {
      setBusy(false);
    }
  };

  const saveToLibrary = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // writeOnly=true: 保存だけなら「写真への追加」権限で済みダイアログが軽い
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        Alert.alert(
          "保存には写真への追加許可が必要です",
          "設定アプリから許可するか、シェアをお使いください。",
          [
            { text: "キャンセル", style: "cancel" },
            { text: "設定を開く", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("ポスターを保存しました 🪧", "写真アプリで確認できます");
    } catch (e) {
      if (__DEV__) console.warn("[poster/export]", e);
      Alert.alert("保存に失敗しました…");
    } finally {
      setBusy(false);
    }
  };

  return { busy, share, saveToLibrary };
}
