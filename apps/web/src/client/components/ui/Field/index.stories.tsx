import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../Input";
import * as Field from "./index";

const meta = {
  title: "UI/Field",
  tags: ["autodocs"],
  component: Field.Root,
} satisfies Meta<typeof Field.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field.Root {...args}>
      <Field.Label>メールアドレス</Field.Label>
      <Input type="email" autoComplete="email" placeholder="name@example.com" />
    </Field.Root>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <Field.Root {...args}>
      <Field.Label>パスワード</Field.Label>
      <Input type="password" autoComplete="new-password" />
      <Field.Description>12 文字以上で、英字と数字をまぜてください</Field.Description>
    </Field.Root>
  ),
};

// 検証はフォームの側で行うので、誤りは invalid と match で外から渡す
export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => (
    <Field.Root {...args}>
      <Field.Label>メールアドレス</Field.Label>
      <Input type="email" autoComplete="email" defaultValue="name@example" />
      <Field.Error match>メールアドレスの形で入力してください</Field.Error>
    </Field.Root>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Field.Root {...args}>
      <Field.Label>メールアドレス</Field.Label>
      <Input type="email" autoComplete="email" defaultValue="name@example.com" />
    </Field.Root>
  ),
};
