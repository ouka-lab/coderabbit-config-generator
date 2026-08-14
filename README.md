# CodeRabbit Config Generator

A web app that generates [CodeRabbit](https://coderabbit.ai/)'s `.coderabbit.yaml` configuration file through a GUI. Fill in the form and the YAML is live-previewed in the right pane, ready to download.

Every field, label, validation rule, and default value is **derived at runtime** from CodeRabbit's official [JSON Schema (`schema.v2.json`)](https://storage.googleapis.com/coderabbit_public_assets/schema.v2.json). Swap the schema and the entire form follows.

## Features

- **Schema-driven / runtime conversion** — Loads `schema.v2.json` and dynamically produces both a Valibot schema (for validation) and render metadata (labels, descriptions, enums, constraints, widget kinds). No fields are hand-written.
- **Recursive generic renderer** — Renders objects, arrays, and nesting as a tree, handling two-level nested arrays and free-form records naturally.
- **Minimal YAML output** — Deeply compares input against the schema's `default` values and strips keys equal to defaults along with empty arrays/objects, emitting a clean YAML of only what matters (a "include defaults" toggle switches to full output).
- **Live preview** — Updates the YAML instantly as you type, with copy / download / reset.
- **Runs in VS Code too** — The same form ships as a VS Code extension that writes `.coderabbit.yaml` straight into your workspace. See [`packages/vscode`](packages/vscode/README.md).

## Tech Stack

| Area | Choice |
|---|---|
| UI | React 19 |
| Forms | [Formisch](https://github.com/fabian-hiller/formisch) (`@formisch/react`) |
| Validation / schema | [Valibot](https://valibot.dev/) |
| Styling | Tailwind CSS 4 |
| YAML | [`yaml`](https://www.npmjs.com/package/yaml) |
| Build | Vite |
| Testing | Vitest + Testing Library |

## Getting Started

Requires **Node.js 22.x** and **pnpm 11.x** (both pinned via Volta and `packageManager`). This repo vendors [`awesome-coderabbit`](https://github.com/coderabbitai/awesome-coderabbit) as a git submodule to power the "official examples" picker on the Import page, so clone with `--recurse-submodules`.

```bash
git clone --recurse-submodules <repo-url>
cd coderabbit-config-generator
pnpm install   # install dependencies
pnpm dev       # start the dev server (Vite)
```

Already cloned without submodules? Run `git submodule update --init --recursive` before `pnpm install`.

`pnpm dev` and `pnpm build` automatically regenerate `packages/core/src/examples/generated/` from the submodule before starting, so the example list always reflects the checked-out submodule commit. See [CONTRIBUTING.md](CONTRIBUTING.md) for more on the development workflow.

Open the URL Vite prints (default `http://localhost:5173`).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check every package + production build (`packages/web/dist/`) |
| `pnpm build:vscode` | Type-check + build the VS Code extension (`packages/vscode/dist/`) |
| `pnpm preview` | Preview the build locally |
| `pnpm typecheck` | Type-check only |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm generate:examples` | Regenerate `packages/core/src/examples/generated/` from the `awesome-coderabbit` submodule |

## Architecture

```
schema.v2.json (single source of truth)
      │  adapter layer (packages/core/src/schema/)
 ┌────────────────────────────┬─────────────────────────────┐
 │ jsonSchemaToValibot(node)  │ toFieldMeta(node, path)     │
 │  builds Valibot            │  computes label/desc/enum/  │
 │  recursively (memoized)    │  constraint/widget kind     │
 └────────────────────────────┴─────────────────────────────┘
      │                              │
      ▼                              ▼
 useForm({ schema })          <FieldRenderer meta path> (recursive, generic)
      │                              │  + widget registry
      └──────────────┬───────────────┘
                     ▼
   getInput(form) → buildConfig (strip defaults) → yaml.stringify → download
```

`schema.v2.json` is the single source of truth, converted by two adapters for different purposes:

- **`jsonSchemaToValibot`** — Recursively converts JSON Schema to a Valibot schema (resolving `$ref`, folding `allOf`/`anyOf`/`oneOf`, memoized). Used for Formisch validation.
- **`toFieldMeta`** — Computes render metadata (label, description, enum, constraints, widget kind) for each node.

### Widget selection

`toFieldMeta` picks a widget kind from each node's type and constraints, and `FieldRenderer` dispatches to the matching field component.

| Condition | Widget |
|---|---|
| `boolean` | Toggle |
| `enum` (≤ 4 items) | Radio |
| `enum` (> 4 items) | Select |
| `enum` (99 language values) | Searchable combobox |
| `string` (short) | Input |
| `string` (long) | Textarea |
| `number` / `integer` | Number input (min/max) |
| `array` of string | Tag input |
| `array` of object | Repeatable group |
| `object` (free record) | Key/value list editor |
| `object` (with properties) | Section |

## Project Structure

A pnpm workspace split by host dependency, so the same UI runs in the browser and in a VS Code webview.

```
packages/
  core/                      # no React, no DOM
    src/schema/
      schema.v2.json         #   vendored official schema (source of truth)
      jsonSchemaToValibot.ts #   JSON Schema → Valibot (recursive, memoized)
      toFieldMeta.ts         #   JSON Schema node → render metadata
      index.ts               #   exposes configSchema / rootMeta
      types.ts               #   FieldMeta types, etc.
    src/output/toYaml.ts     # YAML serialization
    src/import/              # YAML → validated config (paste / example import)
    src/examples/            # official example fixtures (generated)
  ui/                        # React, host-agnostic
    src/form/
      useConfigForm.ts       # useForm wrapper (builds the root schema)
      FieldRenderer.tsx      # recursive renderer (dispatches on meta.kind)
      fields/                # widgets (Boolean/Enum/Text/Number/…)
    src/output/buildConfig.ts# strip-defaults (computes minimal config)
    src/ui/
      YamlPreview.tsx        # right-pane live preview
      InfoTip.tsx            # description tooltip
    src/platform/            # PlatformAdapter contract (see below)
    src/theme.css            # design tokens shared by every host
    src/App.tsx
  web/                       # the browser host
    src/main.tsx             # mounts <Root> behind a PlatformProvider
    src/platform/web.ts      # PlatformAdapter: clipboard + ZIP download
    e2e/                     # Playwright specs
  vscode/                    # the VS Code host (see packages/vscode/README.md)
    src/                     # extension host: command, panel, workspace writes
    webview/platform.ts      # PlatformAdapter: postMessage to the host
```

### PlatformAdapter

`packages/ui` never touches browser or editor APIs. Anything host-specific goes
through a small interface the host supplies:

```ts
interface PlatformAdapter {
  save: (text: string) => Promise<void>;
  copy: (text: string) => Promise<void>;
  saveLabel: string;
  saveTitle?: string;
  canToggleTheme: boolean;
}
```

| | `save` | `canToggleTheme` |
|---|---|---|
| Web | Downloads a ZIP — browsers refuse to save a leading-dot filename | `true` |
| VS Code | Posts to the extension host, which writes `.coderabbit.yaml` into the workspace | `false` — the editor owns the theme |

Adding a host means writing one adapter and an entry point. Nothing in
`packages/ui` changes.

## Testing

Unit and component tests use Vitest (jsdom) + Testing Library, covering the field components, schema conversion, and YAML output.

```bash
pnpm test                # run
pnpm test:coverage       # with coverage
```

CI (GitHub Actions) runs lint, test, and build.
