import { parseTokens } from "#/client/styles/stories/utils/parseTokens.ts";
import { toColorSwatches } from "#/client/styles/stories/utils/toColorSwatches.ts";

import panel from "../panel.module.css";
import styles from "./index.module.css";

type ColorTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--color-"） */
  prefix: string;
};

/** 色のトークン。-foreground の組があれば、その色で「Aa」を重ねて見せる */
export const ColorTokens = ({ css, prefix }: ColorTokensProps) => (
  <div className={`${panel.panel} ${styles.grid}`}>
    {toColorSwatches(parseTokens(css, prefix)).map(({ name, foreground }) => (
      <div key={name} className={styles.item}>
        <div className={styles.swatch} style={{ backgroundColor: `var(${name})` }}>
          {foreground && (
            <span className={styles.sample} style={{ color: `var(${foreground})` }}>
              Aa
            </span>
          )}
        </div>
        <code className={styles.name}>{name}</code>
        {foreground && <code className={styles.value}>文字: {foreground}</code>}
      </div>
    ))}
  </div>
);
