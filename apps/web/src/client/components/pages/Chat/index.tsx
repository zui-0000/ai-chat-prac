// TODO: チャット画面に置き換える。今は oRPC の一覧・作成・ストリーミングの疎通確認用
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { client, orpc } from "../../../orpc";

export const ChatPage = () => {
  const queryClient = useQueryClient();
  const messages = useQuery(orpc.message.list.queryOptions());
  const create = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.message.list.key() }),
    }),
  );
  const [reply, setReply] = useState("");

  const streamReply = async () => {
    setReply("");
    for await (const { delta } of await client.chat.stream({ prompt: "こんにちは" })) {
      setReply((prev) => prev + delta);
    }
  };

  return (
    <main>
      <h1>AI チャット</h1>
      <button type="button" onClick={() => create.mutate({ text: `メッセージ ${Date.now()}` })}>
        メッセージを足す
      </button>
      <ul>
        {messages.data?.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
      <button type="button" onClick={streamReply}>
        返答を流す
      </button>
      <p aria-live="polite">{reply}</p>
    </main>
  );
};
