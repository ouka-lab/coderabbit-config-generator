# CodeRabbit Config Generator for VS Code

The same schema-driven form as the web app, hosted in a VS Code webview, with
one difference that matters: it writes `.coderabbit.yaml` straight into your
workspace instead of downloading a ZIP.

## Running it locally

```bash
pnpm build:vscode          # from the repo root
```

Then press <kbd>F5</kbd> in VS Code with this repo open — `.vscode/launch.json`
starts an Extension Development Host with this package loaded. Run
**CodeRabbit: Open Config Generator** from the command palette.

The build is not incremental, so re-run `pnpm build:vscode` and reload the
Extension Development Host window after changing anything.

## How it is put together

| Layer | Location | Runs in |
|---|---|---|
| Extension host | `src/` | Node, bundled to CJS by esbuild |
| Webview | `webview/` | Chromium, bundled by Vite |
| Form, fields, YAML preview | `@coderabbit-config/ui` | shared with the web app |
| Schema, YAML, import | `@coderabbit-config/core` | shared with the web app |

`webview/` holds only what the browser build cannot supply:

- **`platform.ts`** — the `PlatformAdapter` the shared UI expects. Save and copy
  become `postMessage` calls; `canToggleTheme` is `false` so the UI drops its
  own theme button.
- **`theme.ts`** — mirrors VS Code's `vscode-dark` / `vscode-high-contrast` body
  class onto `<html>` as `.dark`, which is what the shared stylesheet keys off.
- **`index.css`** — pulls in Tailwind plus the shared design tokens from
  `@coderabbit-config/ui`.

Everything crossing the boundary is typed in `src/messages.ts`.

## Notes

- The webview bundle must ship its CSS as a separate file
  (`build.cssCodeSplit: false`): the CSP allows stylesheets from disk, but not
  the inline `<style>` a bundler would otherwise inject at runtime.
- Saving asks before overwriting an existing `.coderabbit.yaml`, and prompts for
  the folder in a multi-root workspace.
- `retainContextWhenHidden` is on, so switching tabs does not discard an
  in-progress form.

## Not implemented yet

- Reading an existing `.coderabbit.yaml` into the form on open. Use the
  **Import Configure** page and paste for now.
- Registering as a `CustomTextEditor`, so opening a `.coderabbit.yaml` shows the
  form instead of raw YAML.
- Packaging (`vsce package`) and Marketplace publishing.
