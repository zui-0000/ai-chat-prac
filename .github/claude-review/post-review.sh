#!/usr/bin/env bash
# Claude のレビューの結果（構造化出力）を App の名前で PR に出す
set -euo pipefail

reviews="repos/$REPO/pulls/$PR/reviews"
status=$(jq -r '.status' <<<"$RESULT")
summary=$(jq -r '.summary' <<<"$RESULT")
count=$(jq '.findings | length' <<<"$RESULT")

# 飛ばしたときは承認しない
if [[ $status != reviewed ]]; then
  gh pr comment "$PR" --repo "$REPO" --body "レビューを飛ばしたわ。$(jq -r '.skip_reason // ""' <<<"$RESULT")"
  exit 0
fi

if ((count == 0)); then
  jq -n --arg sha "$HEAD_SHA" '{commit_id: $sha, event: "APPROVE", body: "指摘ゼロ！LGTMよ！\nパーフェクトね！お疲れさま！"}' |
    gh api "$reviews" --input - >/dev/null
  exit 0
fi

comments=$(jq '[.findings[] | {path, line, side: "RIGHT", body}
  + (if .start_line != null and .start_line < .line then {start_line, start_side: "RIGHT"} else {} end)]' <<<"$RESULT")

if jq -n --arg sha "$HEAD_SHA" --arg summary "$summary" --argjson comments "$comments" \
  '{commit_id: $sha, event: "COMMENT", body: $summary, comments: $comments}' |
  gh api "$reviews" --input - >/dev/null; then
  exit 0
fi

# 差分に無い行が 1 つでも混ざると、GitHub はレビューごと断る。1 つずつ付け直し、付けられなかったものは本文に並べる
echo "::warning::行ごとのコメントをまとめて付けられなかったので、1 つずつ付け直す"
failed=""
for ((i = 0; i < count; i++)); do
  comment=$(jq ".[$i]" <<<"$comments")
  if ! jq --arg sha "$HEAD_SHA" '. + {commit_id: $sha}' <<<"$comment" |
    gh api "repos/$REPO/pulls/$PR/comments" --input - >/dev/null; then
    failed+=$(jq -r '"\n\n### `\(.path)` の \(.line) 行目\n\n\(.body)"' <<<"$comment")
  fi
done

body=$summary
if [[ -n $failed ]]; then
  body+=$'\n\n行に付けられなかった指摘よ。'"$failed"
fi
jq -n --arg sha "$HEAD_SHA" --arg body "$body" '{commit_id: $sha, event: "COMMENT", body: $body}' |
  gh api "$reviews" --input - >/dev/null
