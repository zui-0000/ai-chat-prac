// .void/tsconfig.json の paths が、tsconfig.app.json にすべて写してあるかを確かめる。
// 写しが古くなっても多くは型エラーになるが、エラーが原因と関係ない場所を指すので、ここで原因の分かるメッセージを出して止める
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const appDir = resolve(import.meta.dirname, "..");

// tsconfig のコメントは行の頭からの // だけなので、その行を消して JSON として読む
const readJsonc = (path) =>
  JSON.parse(
    readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("//"))
      .join("\n"),
  );

const resolvePaths = (configPath) => {
  const paths = readJsonc(configPath).compilerOptions?.paths ?? {};
  return Object.fromEntries(
    Object.entries(paths).map(([key, targets]) => [
      key,
      targets.map((target) => resolve(dirname(configPath), target)).sort(),
    ]),
  );
};

const voidPaths = resolvePaths(resolve(appDir, ".void/tsconfig.json"));
const appPaths = resolvePaths(resolve(appDir, "tsconfig.app.json"));

const problems = Object.entries(voidPaths).flatMap(([key, targets]) => {
  if (!(key in appPaths)) return [`"${key}" がありません`];
  if (JSON.stringify(appPaths[key]) !== JSON.stringify(targets)) {
    return [`"${key}" の行き先が違います（.void/tsconfig.json は ${targets.join(", ")}）`];
  }
  return [];
});

if (problems.length > 0) {
  console.error("tsconfig.app.json の paths が .void/tsconfig.json と合っていません:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    ".void/tsconfig.json の paths を、tsconfig.app.json から見たパスに直して写してください",
  );
  process.exit(1);
}
