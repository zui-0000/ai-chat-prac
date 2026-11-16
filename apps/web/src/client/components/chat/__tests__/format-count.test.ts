import { formatCount } from "../format-count";

describe("formatCount", () => {
  test("件数を出すこと", () => {
    expect(formatCount(3)).toBe("3 件");
  });
});
