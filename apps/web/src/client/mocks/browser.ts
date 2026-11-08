import { HttpNetworkFrame } from "msw/experimental";
import { network } from "virtual:msw";

import { handlers } from "./api/router";
import { type ScenarioName, scenarios } from "./api/scenarios";

const isScenarioName = (name: string): name is ScenarioName => name in scenarios;

// ?scenario= で選んだシナリオ。知らない名前なら正常系で動かし、使える名前を知らせる
const selectedScenario = () => {
  const requested = new URLSearchParams(location.search).get("scenario");
  if (!requested) return [];
  if (!isScenarioName(requested)) {
    console.warn(
      `[mock] 知らないシナリオ "${requested}"。正常系で動きます。使えるのは: ${Object.keys(scenarios).join(" / ")}`,
    );
    return [];
  }
  return [scenarios[requested]];
};

// 画面用の入口。開発サーバーのときだけ main.tsx が動的 import で読むので、本番のバンドルには入らない
export const startMocking = async () => {
  network.configure({
    // 上書きを前に置く。MSW は前のハンドラを優先する
    handlers: [...selectedScenario(), ...handlers],
    // Service Worker は画面のファイルの取得も通るので、/rpc の書き忘れだけを知らせる
    onUnhandledFrame: ({ frame, defaults }) => {
      if (
        frame instanceof HttpNetworkFrame &&
        new URL(frame.data.request.url).pathname.startsWith("/rpc")
      ) {
        defaults.warn();
      }
    },
  });
  await network.enable();
};
