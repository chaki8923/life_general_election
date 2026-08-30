import type { ConfigContext, ExpoConfig } from "expo/config";

const STARTUP_AVATAR_ICONS = [
  "./assets/avatar/topyo01.webp",
  "./assets/avatar/topyo02.webp",
  "./assets/avatar/topyo03.webp",
  "./assets/avatar/topyo04.webp",
  "./assets/avatar/topyo05.webp",
  "./assets/avatar/topyo06.webp",
  "./assets/avatar/topyo07.webp",
  "./assets/avatar/topyo08.webp",
  "./assets/avatar/topyo09.webp",
  "./assets/avatar/topyo10.webp",
  "./assets/avatar/topyo11.webp",
  "./assets/avatar/topyo12.webp",
  "./assets/avatar/topyo13.webp",
  "./assets/avatar/topyo14.webp",
  "./assets/avatar/topyo15.webp",
  "./assets/avatar/topyo16.webp",
  "./assets/avatar/topyo17.webp",
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
