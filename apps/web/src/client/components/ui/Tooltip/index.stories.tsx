import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, SendIcon, Trash2Icon } from "lucide-react";

import { IconButton } from "../IconButton";
import * as Tooltip from "./index";

// 名前は押す部品の aria-label で付け、ツールチップには同じ言葉を出す（ガイドと同じ使い方）
const meta = {
  title: "UI/Tooltip",
  tags: ["autodocs"],
  component: Tooltip.Popup,
  args: {
    children: "コピーする",
  },
  render: (args) => (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <IconButton aria-label="コピーする">
            <CopyIcon />
          </IconButton>
        }
      />
      <Tooltip.Popup {...args} />
    </Tooltip.Root>
  ),
} satisfies Meta<typeof Tooltip.Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

// マウスを乗せるか、キーボードでフォーカスすると出る
export const Default: Story = {};

// 上に出す場所を空け、ふだんの向き（上）で見せる
export const Open: Story = {
  render: (args) => (
    <div style={{ paddingBlockStart: "var(--spacing-48)" }}>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="コピーする">
              <CopyIcon />
            </IconButton>
          }
        />
        <Tooltip.Popup {...args} />
      </Tooltip.Root>
    </div>
  ),
};

// 4 つの向きを並べる見本なので、向きは 1 つずつ書き、操作で替えさせない。
// ツールチップは 1 つ開くとほかを閉じるので、開いたままにする（open）
export const Sides: Story = {
  argTypes: { side: { control: false } },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, auto)",
        justifyContent: "center",
        gap: "var(--spacing-48)",
        padding: "var(--spacing-48)",
      }}
    >
      <span />
      <Tooltip.Root open>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="送る">
              <SendIcon />
            </IconButton>
          }
        />
        <Tooltip.Popup side="top">送る</Tooltip.Popup>
      </Tooltip.Root>
      <span />
      <Tooltip.Root open>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="編集する">
              <PencilIcon />
            </IconButton>
          }
        />
        <Tooltip.Popup side="left">編集する</Tooltip.Popup>
      </Tooltip.Root>
      <span />
      <Tooltip.Root open>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="消す">
              <Trash2Icon />
            </IconButton>
          }
        />
        <Tooltip.Popup side="right">消す</Tooltip.Popup>
      </Tooltip.Root>
      <span />
      <Tooltip.Root open>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="コピーする">
              <CopyIcon />
            </IconButton>
          }
        />
        <Tooltip.Popup side="bottom">コピーする</Tooltip.Popup>
      </Tooltip.Root>
      <span />
    </div>
  ),
};

// はみ出しを隠す箱の中でも、ツールチップは #root の外に描くので、箱で切れずに出る
export const InScrollContainer: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        blockSize: "6rem",
        padding: "var(--spacing-8)",
        overflow: "auto",
        border: "var(--border-width-frame) solid var(--color-border)",
        marginBlockStart: "var(--spacing-48)",
      }}
    >
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger
          render={
            <IconButton aria-label="コピーする">
              <CopyIcon />
            </IconButton>
          }
        />
        <Tooltip.Popup {...args} />
      </Tooltip.Root>
      <div style={{ blockSize: "20rem" }} />
    </div>
  ),
};
