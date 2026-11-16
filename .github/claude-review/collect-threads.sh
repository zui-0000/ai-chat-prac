#!/usr/bin/env bash
# まだ解決していない、App が付けた指摘のスレッドを集めて OUT に書く。
# GITHUB_OUTPUT に、App がこの PR をレビューしたことがあるか（reviewed）と、スレッドの数（count）を書く
set -euo pipefail

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

# GraphQL では App の login に [bot] が付かないことがあるので、外して比べる
jq --arg bot "$BOT" '
  def by_bot: (.author.login // "" | sub("\\[bot\\]$"; "")) == $bot;
  {
    reviewed: any(.reviews.nodes[]; by_bot),
    threads: [.reviewThreads.nodes[]
      | select(.isResolved | not)
      | .comments.nodes[0] as $first
      | select($first | by_bot)
      | {id, path, line: (.line // .originalLine), comment_id: $first.databaseId, url: $first.url, body: $first.body}]
  }
' <<<"$pr" >"$RUNNER_TEMP/collected.json"

jq .threads "$RUNNER_TEMP/collected.json" >"$OUT"
{
  echo "reviewed=$(jq .reviewed "$RUNNER_TEMP/collected.json")"
  echo "count=$(jq length "$OUT")"
} >>"$GITHUB_OUTPUT"
