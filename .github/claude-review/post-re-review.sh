#!/usr/bin/env bash
# 再確認の結果を App の名前で PR に出す。直ったスレッドは解決済みにし、全部直っていれば承認する
set -euo pipefail

reviews="repos/$REPO/pulls/$PR/reviews"

# 確かめる指摘が無くても、一度もレビューしていない PR は承認しない
if [[ $REVIEWED != true ]]; then
  gh pr comment "$PR" --repo "$REPO" --body "まだレビューしてないじゃない。先に claude-review のラベルを貼りなさいよね。"
  exit 0
fi

result=${RESULT:-'{}'}
total=$(jq length "$THREADS")
remaining=""

# 動かすのは集めたスレッドだけ。Claude が返した id は、それと突き合わせてから使う
for ((i = 0; i < total; i++)); do
  thread=$(jq ".[$i]" "$THREADS")
  id=$(jq -r .id <<<"$thread")
  answer=$(jq --arg id "$id" \
    '[(.threads // [])[] | select(.id == $id)] | first // {fixed: false, comment: "この指摘は確かめられなかったわ。もう一度ラベルを貼りなさい。"}' \
    <<<"$result")

  jq '{body: .comment}' <<<"$answer" |
    gh api "repos/$REPO/pulls/$PR/comments/$(jq -r .comment_id <<<"$thread")/replies" --input - >/dev/null

  # 解決済みにできなくても、直ったことは返事に書いたので止めない
  if [[ $(jq -r .fixed <<<"$answer") == true ]]; then
    gh api graphql -f id="$id" \
      -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }' >/dev/null ||
      echo "::warning::スレッド $id を解決済みにできなかった"
  else
    remaining+=$(jq -r '"\n- [`\(.path)` の \(.line) 行目](\(.url))"' <<<"$thread")
  fi
done

if [[ -z $remaining ]]; then
  event=APPROVE
  body="LGTMよ！やるじゃない！"
else
  event=COMMENT
  body="まだ直っていない指摘があるわ。${remaining}"$'\n\n'$(jq -r '.summary // ""' <<<"$result")
fi
jq -n --arg sha "$HEAD_SHA" --arg event "$event" --arg body "$body" '{commit_id: $sha, event: $event, body: $body}' |
  gh api "$reviews" --input - >/dev/null
