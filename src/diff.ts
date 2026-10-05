/**
 * Deep JSON diff — shared with Portfolio/lib/json-diff.ts
 */

export type DiffKind = "added" | "removed" | "changed";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type DiffChange = {
  kind: DiffKind;
  path: string;
  before?: JsonValue;
  after?: JsonValue;
};

function isObject(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeOf(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function joinPath(base: string, segment: string | number): string {
  if (typeof segment === "number") return `${base}/${segment}`;
  const escaped = segment.replace(/~/g, "~0").replace(/\//g, "~1");
  return `${base}/${escaped}`;
}

function samePrimitive(a: JsonValue, b: JsonValue): boolean {
  return Object.is(a, b);
}

/**
 * Recursively compare left vs right.
 * Objects: union of sorted keys.
 * Arrays: index-aligned (no LCS / ignore-order).
 */
export function deepDiff(
  left: JsonValue,
  right: JsonValue,
  path = "",
): DiffChange[] {
  const changes: DiffChange[] = [];

  if (typeOf(left) !== typeOf(right)) {
    changes.push({ kind: "changed", path: path || "/", before: left, after: right });
    return changes;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i++) {
      const child = joinPath(path, i);
      if (i >= left.length) {
        changes.push({ kind: "added", path: child, after: right[i] });
      } else if (i >= right.length) {
        changes.push({ kind: "removed", path: child, before: left[i] });
      } else {
        changes.push(...deepDiff(left[i], right[i], child));
      }
    }
    return changes;
  }

  if (isObject(left) && isObject(right)) {
    const keys = Array.from(
      new Set([...Object.keys(left), ...Object.keys(right)]),
    ).sort();
    for (const key of keys) {
      const child = joinPath(path, key);
      const hasL = Object.prototype.hasOwnProperty.call(left, key);
      const hasR = Object.prototype.hasOwnProperty.call(right, key);
      if (!hasL) {
        changes.push({ kind: "added", path: child, after: right[key] });
      } else if (!hasR) {
        changes.push({ kind: "removed", path: child, before: left[key] });
      } else {
        changes.push(...deepDiff(left[key], right[key], child));
      }
    }
    return changes;
  }

  // primitives (and null)
  if (!samePrimitive(left, right)) {
    changes.push({
      kind: "changed",
      path: path || "/",
      before: left,
      after: right,
    });
  }
  return changes;
}

export function summarizeDiff(changes: DiffChange[]): {
  added: number;
  removed: number;
  changed: number;
  total: number;
} {
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const c of changes) {
    if (c.kind === "added") added += 1;
    else if (c.kind === "removed") removed += 1;
    else changed += 1;
  }
  return { added, removed, changed, total: changes.length };
}

export function formatValue(value: JsonValue | undefined): string {
  if (value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function parseJsonSafe(
  text: string,
): { ok: true; value: JsonValue } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as JsonValue };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
