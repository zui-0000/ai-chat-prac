import { parseTokens } from "../parseTokens";

type ParseCase = {
  from: string;
  css: string;
  expected: { name: string; value: string }[];
};

describe("parseTokens", () => {
  test.each`
    from                    | css                                                             | expected
    ${"1 行の宣言"}         | ${":root { --spacing-4: 0.25rem; }"}                            | ${[{ name: "--spacing-4", value: "0.25rem" }]}
    ${"複数行の値"}         | ${":root {\n  --spacing-4: max(\n    1px,\n    2px\n  );\n}"}   | ${[{ name: "--spacing-4", value: "max( 1px, 2px )" }]}
    ${"コメントの中の宣言"} | ${":root { /* --spacing-8: 0.5rem; */ --spacing-4: 0.25rem; }"} | ${[{ name: "--spacing-4", value: "0.25rem" }]}
  `("「$from」の場合、名前と値を取り出すこと", ({ css, expected }: ParseCase) => {
    expect(parseTokens(css, "--spacing-")).toEqual(expected);
  });

  test("名前が prefix で始まらないトークンを除くこと", () => {
    const css = ":root { --spacing-4: 0.25rem; --font-size-12: 0.75rem; }";

    expect(parseTokens(css, "--font-")).toEqual([{ name: "--font-size-12", value: "0.75rem" }]);
  });
});
