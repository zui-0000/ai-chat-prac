import path from "node:path";

const colorTokenMessage =
  "このサイトの色（--color-ai-chat-*）か、役割の色（--color-foreground など）を使ってください。使い分けは apps/web/DESIGN.md にあります";

const colorSchemeBranchMessage =
  "配色（ライト・ダーク）ごとに書き分けないでください。トークンが light-dark() で切り替えます";

// アプリと同じく main.css から @import をたどって、定義のある CSS 変数を集める。
// プラグインは相対パスを実行した場所から探すので、どこから実行しても同じになるよう絶対パスにする
const tokenEntry = path.join(import.meta.dirname, "src/client/styles/main.css");

// 整形は Oxfmt（vp check）が受け持つので、書き方の見た目のルールは入れない
/** @type {import('stylelint').Config} */
export default {
  plugins: ["stylelint-value-no-unknown-custom-properties"],

  // tokens/ は、色の値や材料を書いてトークンを定義する場所なので見ない
  ignoreFiles: ["src/client/styles/tokens/**"],

  rules: {
    // 打ち間違えた CSS 変数は、エラーにならずに黙って無視される
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [tokenEntry],
        message: (name) =>
          `${name} は定義されていない CSS 変数です。打ち間違いがないか、src/client/styles/tokens/ のトークンの名前を確かめてください`,
      },
    ],

    "color-no-hex": [true, { message: `色の値を直接書かず、${colorTokenMessage}` }],
    "color-named": ["never", { message: `色の名前を直接書かず、${colorTokenMessage}` }],

    // color-mix() は、トークンを混ぜる・薄めるときに使うので許す。
    // light-dark() は、部品の CSS で配色ごとに書き分けることになるので止める
    "function-disallowed-list": [
      ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color", "light-dark"],
      {
        message: (name) =>
          name === "light-dark"
            ? colorSchemeBranchMessage
            : `${name}() で色を作らず、${colorTokenMessage}`,
      },
    ],

    // 色の材料は、配色で切り替わらない
    "declaration-property-value-disallowed-list": [
      { "/.*/": ["/--color-primitive-/"] },
      { message: `色の材料（--color-primitive-*）は使わず、${colorTokenMessage}` },
    ],

    // @media (prefers-color-scheme) は OS の設定しか見ず、<html> の color-scheme を替えても切り替わらない
    "media-feature-name-disallowed-list": [
      ["prefers-color-scheme"],
      { message: colorSchemeBranchMessage },
    ],
    "selector-attribute-name-disallowed-list": [
      ["data-theme"],
      { message: colorSchemeBranchMessage },
    ],
  },
};
