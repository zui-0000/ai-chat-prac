// テストの環境の設定（vite.config.ts の server）が効いていることを確かめる
describe("server のテストの環境", () => {
  test("Worker と同じく、DOM を持たないこと", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });
});
