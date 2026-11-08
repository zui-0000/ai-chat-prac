/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 日本語は 1 文字の情報量が多く、既定の文字数制限に引っかかりやすい
    "header-max-length": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
    // 「feat: UI を直す」のように、英大文字の略語で始まる説明を弾かないため
    "subject-case": [0],
  },
};
