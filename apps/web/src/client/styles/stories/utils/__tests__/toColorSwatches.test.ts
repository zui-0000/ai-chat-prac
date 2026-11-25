import { toColorSwatches } from "../toColorSwatches";

describe("toColorSwatches", () => {
  test("組になる色がある -foreground の場合、その色の文字の色にまとめること", () => {
    const tokens = [
      { name: "--color-card", value: "x" },
      { name: "--color-card-foreground", value: "y" },
    ];

    expect(toColorSwatches(tokens)).toEqual([
      { name: "--color-card", foreground: "--color-card-foreground" },
    ]);
  });

  test("組になる色が無い -foreground の場合、1 つの色として残すこと", () => {
    const tokens = [{ name: "--color-foreground", value: "x" }];

    expect(toColorSwatches(tokens)).toEqual([
      { name: "--color-foreground", foreground: undefined },
    ]);
  });
});
