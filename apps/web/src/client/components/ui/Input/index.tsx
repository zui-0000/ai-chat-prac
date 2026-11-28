import { Input as BaseInput } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import styles from "./index.module.css";

// render で別の要素に替えると、そこから className と style も渡せてしまうので、一緒に外す
type InputProps = Omit<ComponentProps<typeof BaseInput>, "className" | "style" | "render">;

export const Input = (props: InputProps) => <BaseInput {...props} className={styles.input} />;
