import { parseTokens } from "#/client/styles/stories/utils/parseTokens.ts";

import panel from "../panel.module.css";
import styles from "./index.module.css";

type PaletteTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--color-primitive-red-"）。見本の名前は、ここを除いて出す */
  prefix: string;
};

/** 色の材料。1 色の段階を 1 行に並べる */
export const PaletteTokens = ({ css, prefix }: PaletteTokensProps) => (
  <div className={`${panel.panel} ${styles.grid}`}>
    {parseTokens(css, prefix).map((token) => (
      <div key={token.name} className={styles.item}>
        <div className={styles.swatch} style={{ backgroundColor: token.value }} />
        <code className={styles.value}>{token.name.replace(prefix, "") || token.name}</code>
        <code className={styles.value}>{token.value}</code>
      </div>
    ))}
  </div>
);
