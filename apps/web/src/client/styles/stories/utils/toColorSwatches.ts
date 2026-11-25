type Token = { name: string; value: string };

// -foreground は、組になる色があればその色の見本に「文字の色」としてまとめる。
// 組の無いもの（--color-foreground）は、1 つの色として見本にする
export const toColorSwatches = (tokens: Token[]) => {
  const names = new Set(tokens.map((token) => token.name));
  return tokens
    .filter(
      (token) =>
        !(token.name.endsWith("-foreground") && names.has(token.name.replace(/-foreground$/, ""))),
    )
    .map((token) => {
      const foreground = `${token.name}-foreground`;
      return { name: token.name, foreground: names.has(foreground) ? foreground : undefined };
    });
};
