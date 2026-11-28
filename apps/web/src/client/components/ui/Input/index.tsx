import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import styles from "./index.module.css";

// render で別の要素に替えると、そこから className と style も渡せてしまうので、一緒に外す
type InputProps = Omit<
  ComponentProps<typeof BaseInput>,
  "className" | "style" | "render" | "type"
> & {
  /** 1 行の文字を書く種類だけ。チェックボックスやファイルなどは、見た目が合わないので別の部品にする */
  type?: "text" | "email" | "password" | "url" | "tel" | "search";
};

export const Input = (props: InputProps) => <BaseInput {...props} className={styles.input} />;
