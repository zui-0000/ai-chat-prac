#!/usr/bin/env bash
# Claude のレビューの結果（構造化出力）を App の名前で PR に出す
set -euo pipefail

here=$(dirname "$0")

# 秘密の値を含むジョブの outputs は GitHub が落とすので、結果が空で届くことがある。黙って抜けないよう、落として知らせる
if ! jq -e 'type == "object"' <<<"${RESULT:-}" >/dev/null 2>&1; then
  gh pr comment "$PR" --repo "$REPO" --body "レビューの結果を受け取れなかったわ。Actions のログを見て、もう一度ラベルを貼りなさい。"
  echo "::error::レビューの結果が空か、JSON として読めない"
  exit 1
fi

# 非公開のリポジトリの名前は、決まりのファイルのパスなどから結果に紛れ込むことがあるので、出す前に伏せる
RESULT=$(jq -L "$here" --arg repo "${HIDE_REPO:-}" --arg marketplace "${HIDE_MARKETPLACE:-}" \
  'include "hide-names"; hide_review([$repo, $marketplace])' <<<"$RESULT")

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
  jq -n --arg sha "$HEAD_SHA" '{commit_id: $sha, event: "APPROVE", body: "指摘ゼロ！ LGTMよ🙌\nパーフェクトね！おつかれさま！！"}' |
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
