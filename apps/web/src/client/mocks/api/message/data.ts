import type { Message } from "@ai-chat/contract";

// message.list と message.create が使う保管。メモリの中に持つので、画面を読み直すと空に戻る
let messages: Message[] = [];
let nextId = 1;

export const listMessages = (): Message[] => [...messages];

export const addMessage = (text: string): Message => {
  const message = { id: nextId++, text, createdAt: new Date().toISOString() };
  messages.push(message);
  return message;
};

// テストごとに空に戻す（api/reset.ts から呼ぶ）
export const resetMessages = () => {
  messages = [];
  nextId = 1;
};
