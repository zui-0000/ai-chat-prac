import { describe, expect, it } from "vite-plus/test";

import { formatCount } from "../format-count";

describe("formatCount", () => {
  it("件数を出すこと", () => {
    expect(formatCount(3)).toBe("3 件");
  });
});
