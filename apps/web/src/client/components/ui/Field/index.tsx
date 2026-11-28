import { Field as BaseField } from "@base-ui/react/field";
import { CircleAlertIcon } from "lucide-react";
import type { ComponentProps } from "react";

import styles from "./index.module.css";

// render で別の要素に替えると、そこから className と style も渡せてしまうので、一緒に外す
type Without<T> = Omit<T, "className" | "style" | "render">;

export const Root = (props: Without<ComponentProps<typeof BaseField.Root>>) => (
  <BaseField.Root {...props} className={styles.root} />
);

export const Label = (props: Without<ComponentProps<typeof BaseField.Label>>) => (
  <BaseField.Label {...props} className={styles.label} />
);

export const Description = (props: Without<ComponentProps<typeof BaseField.Description>>) => (
  <BaseField.Description {...props} className={styles.description} />
);

// 赤がこのサイトの色なので、色だけでは誤りと伝わらない。アイコンを添える。
// 子を渡さないときは Base UI がブラウザの検証の文を入れるので、子を直に置かず render で包み、どちらの文にもアイコンを付ける。
// undefined の子を渡すと、その文を上書きして消すので、渡さない。文が無いときは、アイコンだけを出さない。
// 文は div 1 つにまとめ、強調などを混ぜても、アイコンの横で 1 つの文として折り返す。誤りが 2 つ以上だと Base UI はリストを渡すので、span では包まない
export const Error = ({ children, ...props }: Without<ComponentProps<typeof BaseField.Error>>) => (
  <BaseField.Error
    {...props}
    {...(children === undefined ? {} : { children })}
    className={styles.error}
    render={({ children: message, ...rest }) => (
      <div {...rest}>
        {message ? (
          <>
            <CircleAlertIcon />
            <div>{message}</div>
          </>
        ) : null}
      </div>
    )}
  />
);
