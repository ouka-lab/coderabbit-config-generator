# Contributing

Thanks for your interest in improving CodeRabbit Config Generator. This document covers the local setup, day-to-day workflow, and expectations for pull requests.

## Prerequisites

- **Node.js 22.x** and **pnpm 11.x** (pinned via Volta and `packageManager`)
- **Git**, with submodule support (used to vendor the official example configs)

## Setup

This repo vendors [`coderabbitai/awesome-coderabbit`](https://github.com/coderabbitai/awesome-coderabbit) as a git submodule at `vendor/awesome-coderabbit`. Its `configs/` directory is the source for the "use an official example" picker on the Import page.

```bash
git clone --recurse-submodules <repo-url>
cd coderabbit-config-generator
pnpm install
pnpm dev
```

If you already cloned the repo without `--recurse-submodules`, initialize it separately:

```bash
git submodule update --init --recursive
```

`pnpm dev`, `pnpm build`, `pnpm test` and `pnpm test:coverage` all chain `pnpm generate:examples` first, which runs `packages/core/scripts/generate-examples.ts`: it scans `vendor/awesome-coderabbit/configs/` and regenerates `packages/core/src/examples/generated/examples.generated.ts`. That generated file is gitignored — it is rebuilt on every dev server start, build and test run, so it always reflects whatever commit the submodule is currently checked out at.

If the submodule isn't initialized, `generate:examples` fails fast with a message telling you to run `git submodule update --init --recursive`.

You can also run the generation step manually:

```bash
pnpm generate:examples
```

### Updating the vendored examples

To pull in newer official examples, update the submodule pointer and commit it:

```bash
git submodule update --remote vendor/awesome-coderabbit
git add vendor/awesome-coderabbit
git commit -m "chore: update awesome-coderabbit submodule"
```

Do not commit `packages/core/src/examples/generated/` — it's generated on demand and is gitignored.

## Coding conventions

- Formatting and style are enforced by ESLint (`eslint.config.mjs`, `@stylistic/eslint-plugin`): 2-space indent, single quotes, semicolons. Run `pnpm lint` (or `pnpm lint:fix` to auto-fix) before committing.
- Comments are written in English only, and only when the *why* isn't obvious from the code itself (a non-obvious constraint, a workaround, a subtle invariant). Don't add comments that restate what the code already says.
- Follow the existing patterns in the codebase (see the [Architecture](README.md#architecture) and [Project Structure](README.md#project-structure) sections of the README) rather than introducing new abstractions.

## Testing

Unit and component tests use Vitest (jsdom) + Testing Library.

```bash
pnpm test                # run once
pnpm test:coverage       # with coverage
```

Add tests alongside new components/modules (`Foo.tsx` → `Foo.test.tsx`), following the existing test files as examples.

## Before opening a pull request

Make sure the following all pass:

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
```

Keep pull requests focused on a single change, and describe the *why* behind the change in the description.
