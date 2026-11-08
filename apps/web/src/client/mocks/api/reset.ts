import { resetMessages } from "./message/data";

// テストごとに、各コンテキストの偽物の保管をすべて空に戻す
export const resetMockData = () => {
  resetMessages();
};
