import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { deepDiff, parseJsonSafe, type JsonValue } from "./diff.js";
import { formatReport } from "./format.js";

function usage(): never {
  console.error("Usage: npx tsx src/cli.ts <left.json> <right.json>");
  process.exit(1);
}

function loadJson(path: string): JsonValue {
  const text = readFileSync(resolve(path), "utf8");
  const parsed = parseJsonSafe(text);
  if (!parsed.ok) {
    console.error(`Failed to parse ${path}: ${parsed.error}`);
    process.exit(1);
  }
  return parsed.value;
}

function main(): void {
  const [, , leftPath, rightPath] = process.argv;
  if (!leftPath || !rightPath) usage();

  const left = loadJson(leftPath);
  const right = loadJson(rightPath);
  const changes = deepDiff(left, right);
  console.log(formatReport(changes));
}

main();
