# JSON Diff Viewer

A **TypeScript** CLI that performs a **deep structural diff** between two JSON documents. It reports **added**, **removed**, and **changed** paths using JSON Pointer–style paths (e.g. `/user/name`). No runtime dependencies beyond Node.

An interactive **browser demo** is available on the live portfolio site: [rjedwards.dev/projects/json-diff](https://rjedwards.dev/projects/json-diff).

## How it works

| Case | Behavior |
|------|----------|
| **Objects** | Compare the union of keys (sorted); recurse into shared keys |
| **Arrays** | Index-aligned compare (no LCS / ignore-order) |
| **Type mismatch** | Single `changed` at that path |
| **Primitives** | `changed` when values differ (`Object.is`) |

## Requirements

- Node.js 18+
- Dev deps: `typescript`, `tsx` (install once)

## Install & run

```bash
npm install
npx tsx src/cli.ts fixtures/nested-left.json fixtures/nested-right.json
```

Or via script:

```bash
npm run diff -- fixtures/array-left.json fixtures/array-right.json
```

Sample fixtures: `nested-*`, `array-*`, `types-*` (same samples as the portfolio presets).

## Project layout

```
src/
  diff.ts     Deep-diff engine
  format.ts   CLI text formatting
  cli.ts      File-based entrypoint
fixtures/     Shared demo JSON pairs
```
