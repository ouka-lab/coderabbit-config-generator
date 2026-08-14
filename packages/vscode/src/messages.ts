// The only channel between the shared UI and VS Code. The webview never calls
// a VS Code API directly; it posts one of these and the extension host acts on
// it, so `packages/ui` stays host-agnostic.
export type WebviewMessage
  = | { type: 'save'; text: string }
    | { type: 'copy'; text: string };
