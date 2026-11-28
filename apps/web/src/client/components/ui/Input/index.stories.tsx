import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Field from "../Field";
import { Input } from "./index";

// 名前は、見本でも使うときと同じく、Field のラベルで付ける
const meta = {
  title: "UI/Input",
  tags: ["autodocs"],
  component: Input,
  args: {
    type: "email",
    autoComplete: "email",
    placeholder: "name@example.com",
  },
  parameters: { label: "メールアドレス" },
  // 押せないことは Field.Root にも渡し、ラベルも一緒に薄くする（Field のガイドと同じ使い方）
  render: (args, { parameters }) => (
    <Field.Root disabled={args.disabled}>
      <Field.Label>{parameters.label}</Field.Label>
      <Input {...args} />
    </Field.Root>
  ),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Password: Story = {
  args: {
    type: "password",
    autoComplete: "current-password",
    placeholder: undefined,
  },
  parameters: { label: "パスワード" },
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
