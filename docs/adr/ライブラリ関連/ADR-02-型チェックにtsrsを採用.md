---
status: accepted
date: 2026-11-08
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# 型チェックに tsrs を採用

## 背景と課題 (Context and Problem Statement)

型チェックの道具が Rust や Go に移っていく流れに乗りたい。検査・テスト・ビルドは Vite Task でキャッシュし、読んだファイルが変わっていなければ飛ばしている。

Go 版の `tsc` は、読んだファイルを Vite Task が追えない。そのため検査をキャッシュすると、型エラーがあっても前の結果で通ってしまうことがあった。

## 決定要因 (Decision Drivers)

- Vite Task のキャッシュと組み合わせても、型エラーを見逃さないこと
- `tsc` と同じエラーを出すこと
- Vite+ が持つ道具とそろうこと（Vite+ も型を使う lint に tsrs を使う）

## 検討した選択肢 (Considered Options)

- tsrs
- `tsc`（Go 版）

## 決定 (Decision Outcome)

**選択: tsrs**

決め手は、**読んだファイルを Vite Task が追えるので、検査をキャッシュしても型エラーを見逃さない**こと。

- `vp run typecheck` を tsrs で動かす。tsrs には `-b` が無いので、tsconfig ごとに `-p` で回す
- 版は Vite+ が持つ版にそろえ、2 つの版を入れない
- `typescript` は依存から消さず、困ったときに `tsc --noEmit` に戻せるようにしておく

### 結果 (Consequences)

- Good, because 検査をキャッシュしても、型エラーを見逃さない
- Good, because Vite+ の lint と同じ型チェックの道具になる
- Bad, because 試験版なので、`tsc` と結果が違うことがある（エラーの順番など）
- Bad, because エディタの TypeScript が別の版だと、まれに結果がずれる
- Bad, because 上げるときに、出どころ（provenance）を確かめる手間がかかる

### 確認方法 (Confirmation)

わざと型エラーを入れて `vp run typecheck` が 0 以外で終わること。続けて同じ検査を回しても、キャッシュで通らないこと。

## 各選択肢の評価 (Pros and Cons of the Options)

### tsrs — 採用

- Good, because Vite Task が読んだファイルを追える
- Good, because 試した型エラーでは、`tsc` と同じ場所・同じ番号のエラーが出た
- Neutral, because 型エラーのときの終了コードは `tsc` が 1、tsrs が 2。どちらも 0 でないので検査は止まる

### `tsc`（Go 版）

- Good, because 本家で、情報が多い
- Bad, because 読んだファイルを Vite Task が追えず、検査をキャッシュできない（キャッシュすると型エラーを見逃す）
