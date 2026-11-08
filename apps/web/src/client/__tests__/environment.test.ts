// テストの環境の設定（vite.config.ts の client）が効いていることを確かめる
describe("client のテストの環境", () => {
  test("DOM を使えること", () => {
    const button = document.createElement("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  test("localStorage を使えること", () => {
    localStorage.setItem("draft", "こんにちは");
    expect(localStorage.getItem("draft")).toBe("こんにちは");
    localStorage.removeItem("draft");
  });
});
