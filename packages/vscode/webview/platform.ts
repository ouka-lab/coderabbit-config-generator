import type { PlatformAdapter } from '@coderabbit-config/ui';
import type { WebviewMessage } from '../src/messages';

// `post` is injected rather than reached for, so this stays callable outside a
// webview — `acquireVsCodeApi` only exists inside one, and only once per load.
export function createVscodePlatform(
  post: (message: WebviewMessage) => void,
): PlatformAdapter {
  return {
    // Both are fire-and-forget: the extension host reports the outcome as a
    // VS Code notification, which is where users look for it.
    save: async text => post({ type: 'save', text }),
    copy: async text => post({ type: 'copy', text }),
    saveLabel: 'Save to workspace',
    saveTitle: `Writes .coderabbit.yaml into the workspace folder`,
    // VS Code imposes its theme on the webview, so there is nothing to toggle.
    canToggleTheme: false,
  };
}
