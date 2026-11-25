import "#/client/styles/main.css";
import type { Preview } from "@storybook/react-vite";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

// トークンは light-dark() で書いてあるので、<html> の color-scheme を替えるだけで、どの部品も切り替わる
const applyColorScheme = (scheme: unknown) => {
  const root = document.documentElement;
  if (scheme === "light" || scheme === "dark") {
    root.style.colorScheme = scheme;
  } else {
    root.style.removeProperty("color-scheme");
  }
};

// トークンのページ（ストーリーの無い MDX）では decorator が動かないので、Storybook の通知でも付ける。
// storybook/internal は addon を作る人向けの API で、Storybook を上げたときに変わることがある
const channel = addons.getChannel();
channel.on(SET_GLOBALS, ({ globals }) => applyColorScheme(globals.colorScheme));
channel.on(GLOBALS_UPDATED, ({ globals }) => applyColorScheme(globals.colorScheme));

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: "配色",
      toolbar: {
        title: "配色",
        icon: "mirror",
        items: [
          // "os" は、OS の設定に合わせる（トークンの color-scheme: light dark のまま）
          { value: "os", title: "OS に合わせる", icon: "browser" },
          { value: "light", title: "ライト", icon: "sun" },
          { value: "dark", title: "ダーク", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: "os",
  },
  decorators: [
    (Story, { globals }) => {
      applyColorScheme(globals.colorScheme);
      return <Story />;
    },
  ],
  parameters: {
    options: {
      // サイドバーの並び。いちばん探される部品を上にし、トークンは main.css が読み込む順、部品から使わない材料を最後にする
      storySort: {
        order: [
          "はじめに",
          "UI",
          "Chat",
          "DesignTokens",
          [
            "Color",
            "Font",
            "LineHeight",
            "LetterSpacing",
            "Spacing",
            "Size",
            "BorderWidth",
            "BorderRadius",
            "Elevation",
            "Primitive",
          ],
          "Guidelines",
        ],
      },
    },
  },
};

export default preview;
