import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";

import styles from "./index.module.css";

// render で別の要素に替えると、そこから className と style も渡せてしまうので、一緒に外す。type は Base UI が button を既定にする
type ButtonProps = Omit<
  ComponentProps<typeof BaseButton>,
  "className" | "style" | "render" | "nativeButton"
> & {
  /** `primary` は主な操作。1 つの領域に 1 つだけ置く */
  variant?: "primary" | "default";
};

export const Button = ({ variant = "default", ...props }: ButtonProps) => (
  <BaseButton {...props} className={styles.button} data-variant={variant} />
);
