# 名前を正規表現としてではなく、文字のまま探す
def escape_regex: gsub("(?<c>[\\\\^$.|?*+()\\[\\]{}/-])"; "\\\(.c)");

# 決まりのファイルのパスなどから結果に紛れ込んだ名前を伏せる。ログの伏せ字は PR への書き込みには効かないため
def hide($names):
  reduce ($names[] | select(type == "string" and . != "")) as $name (.;
    gsub($name | escape_regex; "***"; "i"));

def hide_if_string($names): if type == "string" then hide($names) else . end;

# 書き換えるのは、PR に文として出すものと path だけ。status や line を書き換えると、出し方が変わってしまう。
# path も伏せるのは、名前を含む outputs を GitHub が落とすため（このリポジトリの中のパスに名前は入らない）
def hide_review($names):
  (if has("summary") then .summary |= hide_if_string($names) else . end)
  | (if has("skip_reason") then .skip_reason |= hide_if_string($names) else . end)
  | (if (.findings | type) == "array"
     then .findings |= map(
       if type == "object"
       then (if has("body") then .body |= hide_if_string($names) else . end)
         | (if has("path") then .path |= hide_if_string($names) else . end)
       else . end)
     else . end);

# id は集めたスレッドと突き合わせるので書き換えない
def hide_re_review($names):
  (if has("summary") then .summary |= hide_if_string($names) else . end)
  | (if (.threads | type) == "array"
     then .threads |= map(if type == "object" and has("comment") then .comment |= hide_if_string($names) else . end)
     else . end);
