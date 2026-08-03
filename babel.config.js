/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Zustand persist 等の ESM が import.meta を使うため Web 向けに変換する
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
