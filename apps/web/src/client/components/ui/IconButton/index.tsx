import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps, ReactElement } from "react";

import styles from "./index.module.css";

// 字が無いので、読み上げる名前を必ず渡させる。aria-labelledby を一緒に渡すと、そちらが名前になり aria-label が読まれないので外す。render で別の要素に替えると、そこから className と style も渡せてしまうので、一緒に外す。type は Base UI が button を既定にする
type IconButtonProps = Omit<
  ComponentProps<typeof BaseButton>,
  "className" | "style" | "render" | "nativeButton" | "children" | "aria-label" | "aria-labelledby"
> & {
  /** 読み上げる名前。押すと何が起きるかを書く（「コピーする」など） */
  "aria-label": string;
  /** lucide-react のアイコンを 1 つ */
  children: ReactElement;
  /** `primary` は入力欄の送る・止めるだけ。赤く塗る */
  variant?: "primary" | "default";
};

export const IconButton = ({ variant = "default", ...props }: IconButtonProps) => (
  <BaseButton {...props} className={styles.iconButton} data-variant={variant} />
);
