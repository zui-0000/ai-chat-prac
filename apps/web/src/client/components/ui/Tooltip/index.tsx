import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactElement } from "react";

import styles from "./index.module.css";

type Without<T> = Omit<T, "className" | "style" | "render">;

export const Provider = BaseTooltip.Provider;

export const Root = BaseTooltip.Root;

// 省くと Base UI が button を描き、IconButton を中に置くとボタンが入れ子になるので、押す部品を render で必ず渡させる
type TriggerProps = Without<ComponentProps<typeof BaseTooltip.Trigger>> & {
  /** 押す部品を 1 つ（`<IconButton aria-label="コピーする">` など）。ツールチップと同じ言葉の名前を付けておく */
  render: ReactElement;
};

export const Trigger = (props: TriggerProps) => <BaseTooltip.Trigger {...props} />;

type PopupProps = Without<ComponentProps<typeof BaseTooltip.Popup>> & {
  /** 押す部品のどちら側に出すか。場所が足りなければ反対側に回る */
  side?: ComponentProps<typeof BaseTooltip.Positioner>["side"];
  /** 押す部品の、どこにそろえるか */
  align?: ComponentProps<typeof BaseTooltip.Positioner>["align"];
};

export const Popup = ({ side = "top", align = "center", ...props }: PopupProps) => (
  <BaseTooltip.Portal>
    {/* 押す部品との間は 8px（既定の文字サイズで --spacing-8 と同じ）。sideOffset は CSS の変数を読まないので、数値で渡す */}
    <BaseTooltip.Positioner side={side} align={align} sideOffset={8} className={styles.positioner}>
      <BaseTooltip.Popup {...props} className={styles.popup} />
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
);
