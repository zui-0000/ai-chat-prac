import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./index";

// TODO: 名前を付ける Field がまだ無いので、見本では aria-label で名前を付ける
const meta = {
  title: "UI/Input",
  tags: ["autodocs"],
  component: Input,
  args: {
    "aria-label": "メールアドレス",
    type: "email",
    autoComplete: "email",
    placeholder: "name@example.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Password: Story = {
  args: {
    "aria-label": "パスワード",
    type: "password",
    autoComplete: "current-password",
    placeholder: undefined,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "name@example.com",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "name@example.com",
  },
};
