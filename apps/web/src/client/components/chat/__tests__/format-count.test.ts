import { formatCount } from "../format-count";

describe("formatCount", () => {
  test("件数を出すこと", () => {
    expect(formatCount(3)).toBe("3 件");
  });

  test("0 件のときは「なし」と出すこと", () => {
    expect(formatCount(0)).toBe("なし");
  });
});
