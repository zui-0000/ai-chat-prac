import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, SendIcon, Trash2Icon } from "lucide-react";

import { IconButton } from "./index";

const meta = {
  title: "UI/IconButton",
  tags: ["autodocs"],
  component: IconButton,
  args: {
    "aria-label": "コピーする",
    children: <CopyIcon />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
    "aria-label": "送る",
    children: <SendIcon />,
  },
};

// 主な操作は 1 つの領域に 1 つだけなので、並べる見本では種類を替えさせない
export const Group: Story = {
  args: { variant: "default" },
  argTypes: { variant: { control: false } },
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--spacing-4)" }}>
      <IconButton {...args} aria-label="コピーする">
        <CopyIcon />
      </IconButton>
      <IconButton {...args} aria-label="編集する">
        <PencilIcon />
      </IconButton>
      <IconButton {...args} aria-label="消す">
        <Trash2Icon />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--spacing-4)" }}>
      <IconButton {...args} variant="primary" aria-label="送る" disabled>
        <SendIcon />
      </IconButton>
      <IconButton {...args} aria-label="コピーする" disabled>
        <CopyIcon />
      </IconButton>
    </div>
  ),
};
