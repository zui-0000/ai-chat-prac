import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("#root is not found.");

if (import.meta.env.DEV) {
  // 動的 import なので、本番のバンドルには入らない
  const { startMocking } = await import("#/client/mocks/browser.ts");
  await startMocking();
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
