// Capabilities the UI needs from whatever host it runs in. Components depend
// on this interface instead of browser or editor APIs directly, so the same
// components render both in the web app and in a VS Code webview.
export interface PlatformAdapter {
  // Puts the config somewhere the user can reach it. The browser downloads a
  // file; an editor host writes it straight into the open workspace.
  save: (text: string) => Promise<void>;
  copy: (text: string) => Promise<void>;
  // The save button's wording depends on where the config ends up.
  saveLabel: string;
  saveTitle?: string;
  // VS Code imposes its own theme on webviews, leaving nothing to toggle.
  canToggleTheme: boolean;
}
