import type { DiffChange } from "./diff.js";
import { formatValue, summarizeDiff } from "./diff.js";

export function formatChangeLine(change: DiffChange): string {
  const path = change.path || "/";
  if (change.kind === "added") {
    return `+ ${path}: ${formatValue(change.after)}`;
  }
  if (change.kind === "removed") {
    return `- ${path}: ${formatValue(change.before)}`;
  }
  return `~ ${path}: ${formatValue(change.before)} → ${formatValue(change.after)}`;
}

export function formatReport(changes: DiffChange[]): string {
  const summary = summarizeDiff(changes);
  const lines = [
    `Summary: ${summary.added} added, ${summary.removed} removed, ${summary.changed} changed (${summary.total} total)`,
    "",
  ];
  if (changes.length === 0) {
    lines.push("(no differences)");
  } else {
    for (const c of changes) {
      lines.push(formatChangeLine(c));
    }
  }
  return lines.join("\n");
}
