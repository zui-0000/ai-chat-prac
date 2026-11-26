import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon, SendIcon } from "lucide-react";

import { Button } from "./index";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "保存する",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "送る",
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--spacing-8)" }}>
      <Button {...args} variant="primary">
        <SendIcon />
        送る
      </Button>
      <Button {...args}>
        <PlusIcon />
        新しい会話
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--spacing-8)" }}>
      <Button {...args} variant="primary" disabled>
        送る
      </Button>
      <Button {...args} disabled>
        保存する
      </Button>
    </div>
  ),
};

// ツールバーの「配色」と同じ設定で、配色を決めて見せる
export const Light: Story = {
  ...WithIcon,
  globals: { colorScheme: "light" },
};

export const Dark: Story = {
  ...WithIcon,
  globals: { colorScheme: "dark" },
};
