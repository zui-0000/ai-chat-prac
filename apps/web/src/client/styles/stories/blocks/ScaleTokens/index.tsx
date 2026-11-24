import { parseTokens } from "#/client/styles/stories/utils/parseTokens.ts";
import { type ScaleKind, toScalePreview } from "#/client/styles/stories/utils/toScalePreview.ts";

import panel from "../panel.module.css";
import styles from "./index.module.css";

type ScaleTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--spacing-"） */
  prefix: string;
  /** 見本の描き方 */
  kind: ScaleKind;
};

/** 色のほかのトークン。1 行に「名前・値・見本」を並べる */
export const ScaleTokens = ({ css, prefix, kind }: ScaleTokensProps) => (
  <div className={`${panel.panel} ${styles.rows}`}>
    {parseTokens(css, prefix).map((token) => {
      const { shape, style, text } = toScalePreview(kind, `var(${token.name})`);
      return (
        <div key={token.name} className={styles.row}>
          <code className={styles.name}>{token.name}</code>
          <code className={styles.value}>{token.value}</code>
          <div className={styles[shape]} style={style}>
            {text}
          </div>
        </div>
      );
    })}
  </div>
);
