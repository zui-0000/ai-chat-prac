#!/usr/bin/env bash
# まだ解決していない、App が付けた指摘のスレッドを集めて OUT に書く。
# 入力（環境変数）: GH_TOKEN・REPO・PR・BOT（App の slug）・OUT
# 出力（GITHUB_OUTPUT）: reviewed（App がこの PR をレビューしたことがあるか）・count（集めたスレッドの数）
set -euo pipefail

# GraphQL では、App の login に [bot] が付かないことがあるので、外して比べる
pr=$(gh api graphql -F owner="${REPO%/*}" -F name="${REPO#*/}" -F number="$PR" -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviews(first: 100) { nodes { author { login } } }
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          path
          line
          originalLine
          comments(first: 1) { nodes { databaseId url body author { login } } }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest')

jq --arg bot "$BOT" '
  def by_bot: (.author.login // "" | sub("\\[bot\\]$"; "")) == $bot;
  [.reviewThreads.nodes[]
    | select(.isResolved | not)
    | .comments.nodes[0] as $first
    | select($first | by_bot)
    | {id, path, line: (.line // .originalLine), comment_id: $first.databaseId, url: $first.url, body: $first.body}]
' <<<"$pr" >"$OUT"

reviewed=$(jq --arg bot "$BOT" \
  'any(.reviews.nodes[]; (.author.login // "" | sub("\\[bot\\]$"; "")) == $bot)' <<<"$pr")
{
  echo "reviewed=$reviewed"
  echo "count=$(jq length "$OUT")"
} >>"$GITHUB_OUTPUT"
