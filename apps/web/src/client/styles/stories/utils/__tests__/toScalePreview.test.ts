import { type ScaleKind, toScalePreview } from "../toScalePreview";

type PreviewCase = { kind: ScaleKind; shape: string; property: string };

describe("toScalePreview", () => {
  test.each`
    kind               | shape           | property
    ${"fontFamily"}    | ${"text"}       | ${"fontFamily"}
    ${"fontSize"}      | ${"text"}       | ${"fontSize"}
    ${"fontWeight"}    | ${"text"}       | ${"fontWeight"}
    ${"lineHeight"}    | ${"lineHeight"} | ${"lineHeight"}
    ${"letterSpacing"} | ${"text"}       | ${"letterSpacing"}
    ${"spacing"}       | ${"bar"}        | ${"width"}
    ${"size"}          | ${"bar"}        | ${"width"}
    ${"borderWidth"}   | ${"box"}        | ${"borderWidth"}
    ${"radius"}        | ${"box"}        | ${"borderRadius"}
    ${"elevation"}     | ${"box"}        | ${"boxShadow"}
  `(
    "$kind の場合、$shape の見本の $property に値を当てること",
    ({ kind, shape, property }: PreviewCase) => {
      const preview = toScalePreview(kind, "var(--x)");

      expect(preview.shape).toBe(shape);
      expect(preview.style).toEqual({ [property]: "var(--x)" });
    },
  );
});
