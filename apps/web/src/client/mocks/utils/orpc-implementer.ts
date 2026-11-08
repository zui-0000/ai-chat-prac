import { contract } from "@ai-chat/contract";
import { implement } from "@orpc/server";

// 偽物の実装の土台。本物と同じく約束から作るので、返す値が約束とずれると型エラーになる
export const os = implement(contract);
