import { resetMessages } from "./message/data";

// テストごとに、各コンテキストのモックの保管をすべて空に戻す
export const resetMockData = () => {
  resetMessages();
};
