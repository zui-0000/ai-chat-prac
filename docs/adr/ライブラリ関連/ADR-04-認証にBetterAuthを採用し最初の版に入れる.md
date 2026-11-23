---
status: accepted
date: 2026-11-15
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# 認証に Better Auth を採用し最初の版に入れる

## 背景と課題 (Context and Problem Statement)

会話を人ごとに保存し、AI の利用料も守りたい。あとから会話に持ち主を足すと、会話の DB と API を作り直すことになる。

## 決定要因 (Decision Drivers)

- 会話の持ち主を最初から持てること
- 認証の API とクライアントを、自分で作らずに済むこと
- 外のサービスに頼らずに試せるログインの方法があること

## 検討した選択肢 (Considered Options)

- 最初の版から、Void に組み込まれた Better Auth でログインを必須にする
- ログインしなくても使える（ゲスト）
- 認証をあとから足す

## 決定 (Decision Outcome)

**選択: 最初の版から、Void に組み込まれた Better Auth でログインを必須にする**

決め手は、**あとから持ち主を足すと会話の DB と API を作り直すことになるうえ、Void に組み込まれていて、認証の API もクライアントも出してくれる**こと。

- ログインの方法は、メールアドレスとパスワード・Google・X。外の登録が要らないメールアドレスとパスワードを先に作る
- 認証の API（`/api/auth`）は Void が出し、oRPC の契約（設計関連/ADR-01）には入れない。画面は自分で作る
- ログインしていない人は、ルートの読み込みの前に `/login` に移す

### 結果 (Consequences)

- Good, because 会話の持ち主を最初から持てる
- Good, because 認証の API とクライアントを自分で作らずに済む
- Bad, because 試すのにアカウントの登録が要る
- Bad, because Google と X は、それぞれのサービスでアプリを登録する準備が要る
- Bad, because 認証の API は `/rpc` でないので、モックの BE（設計関連/ADR-02）を別に用意する

## 各選択肢の評価 (Pros and Cons of the Options)

### 最初の版から、Void に組み込まれた Better Auth でログインを必須にする — 採用

- Good, because Void に組み込まれていて、設定が少ない
- Good, because メールアドレスとパスワードなら、外の登録なしで試せる

### ログインしなくても使える（ゲスト）

- Good, because 登録なしで、すぐ試せる
- Bad, because 会話の持ち主の扱い（ゲストの会話をどう引き継ぐかなど）が増える

### 認証をあとから足す

- Good, because 最初の版を早く作れる
- Bad, because 会話の DB と API を作り直すことになる
