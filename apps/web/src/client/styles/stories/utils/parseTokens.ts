// トークンの一覧を CSS から作る。トークンを足しても、見本のページを書き直さずに済む
export const parseTokens = (css: string, prefix: string) => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => ({ name, value: value.replace(/\s+/g, " ").trim() }))
    .filter((token) => token.name.startsWith(prefix));
};
