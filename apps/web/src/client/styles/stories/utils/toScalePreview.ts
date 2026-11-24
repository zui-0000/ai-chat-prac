import type { CSSProperties } from "react";

export type ScaleKind =
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "letterSpacing"
  | "spacing"
  | "size"
  | "borderWidth"
  | "radius"
  | "elevation";

/** 見本の形。ScaleTokens の CSS のクラスの名前と同じ */
type PreviewShape = "text" | "lineHeight" | "bar" | "box";

const SAMPLE_TEXT = "AI チャット Chat 0123";
const LINE_HEIGHT_TEXT =
  "行の高さの見本。長い文章を折り返したとき、行と行の間がどれくらいあくかを見る。";

// トークンの値（var(--名前)）を、種類ごとに見本のどの性質へ当てるかを決める
export const toScalePreview = (
  kind: ScaleKind,
  value: string,
): { shape: PreviewShape; style: CSSProperties; text?: string } => {
  const previews: Record<ScaleKind, { shape: PreviewShape; style: CSSProperties; text?: string }> =
    {
      fontFamily: { shape: "text", style: { fontFamily: value }, text: SAMPLE_TEXT },
      fontSize: { shape: "text", style: { fontSize: value }, text: SAMPLE_TEXT },
      fontWeight: { shape: "text", style: { fontWeight: value }, text: SAMPLE_TEXT },
      lineHeight: { shape: "lineHeight", style: { lineHeight: value }, text: LINE_HEIGHT_TEXT },
      letterSpacing: { shape: "text", style: { letterSpacing: value }, text: "AI CHAT" },
      spacing: { shape: "bar", style: { width: value } },
      size: { shape: "bar", style: { width: value } },
      borderWidth: { shape: "box", style: { borderWidth: value } },
      radius: { shape: "box", style: { borderRadius: value } },
      elevation: { shape: "box", style: { boxShadow: value } },
    };
  return previews[kind];
};
