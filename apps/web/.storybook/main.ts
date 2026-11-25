import type { StorybookConfig } from "@storybook/react-vite";

// apps/web/vite.config.ts のうち、Storybook では動かさない plugin（名前の始まり）。
// Void（中で Cloudflare の plugin も足す）は Worker と DB を立ち上げ、TanStack Router はルートの型を書き出し、
// MSW は Service Worker を配る。どれも部品とトークンを見るのに要らず、Cloudflare の plugin は Storybook の設定では起動できない
const APP_ONLY_PLUGIN_PREFIXES = ["void:", "vite-plugin-cloudflare", "tanstack", "msw"];

const config: StorybookConfig = {
  stories: ["./index.mdx", "../src/client/**/*.mdx", "../src/client/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-mcp"],
  framework: "@storybook/react-vite",
  core: {
    disableTelemetry: true,
  },
  features: {
    // addon-mcp が、部品とドキュメントの一覧をここから作る
    componentsManifest: true,
  },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: viteConfig.plugins
      ?.flat()
      .filter(
        (plugin) =>
          !(
            plugin &&
            "name" in plugin &&
            APP_ONLY_PLUGIN_PREFIXES.some((prefix) => plugin.name.startsWith(prefix))
          ),
      ),
  }),
};

export default config;
