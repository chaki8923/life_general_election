import type { ConfigContext, ExpoConfig } from "expo/config";

const STARTUP_AVATAR_ICONS = [
  "./assets/startup-icons/topyo01.png",
  "./assets/startup-icons/topyo02.png",
  "./assets/startup-icons/topyo03.png",
  "./assets/startup-icons/topyo04.png",
  "./assets/startup-icons/topyo05.png",
  "./assets/startup-icons/topyo06.png",
  "./assets/startup-icons/topyo07.png",
  "./assets/startup-icons/topyo08.png",
  "./assets/startup-icons/topyo09.png",
  "./assets/startup-icons/topyo10.png",
  "./assets/startup-icons/topyo11.png",
  "./assets/startup-icons/topyo12.png",
  "./assets/startup-icons/topyo13.png",
  "./assets/startup-icons/topyo14.png",
  "./assets/startup-icons/topyo15.png",
  "./assets/startup-icons/topyo16.png",
  "./assets/startup-icons/topyo17.png",
] as const;

function pickRandomStartupAvatarIcon() {
  return STARTUP_AVATAR_ICONS[
    Math.floor(Math.random() * STARTUP_AVATAR_ICONS.length)
  ];
}

export default ({ config }: ConfigContext): ExpoConfig => {
  // EASで生成するアプリアイコンは固定のままにし、Expo Goだけをランダム化する。
  if (process.env.EAS_BUILD === "true") {
    return config as ExpoConfig;
  }

  // Expo Goはネイティブスプラッシュの代わりにapp configのアイコンを表示する。
  // 1回のconfig評価では全プラットフォームに同じ1体を渡す。
  const icon = pickRandomStartupAvatarIcon();

  return {
    ...config,
    icon,
    ios: {
      ...config.ios,
      icon,
    },
    android: {
      ...config.android,
      icon,
    },
  } as ExpoConfig;
};
