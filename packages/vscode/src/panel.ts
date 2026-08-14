import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import type { WebviewMessage } from './messages';

const VIEW_TYPE = 'coderabbitConfig.generator';
const CONFIG_FILENAME = '.coderabbit.yaml';

let current: vscode.WebviewPanel | undefined;

export function showConfigPanel(extensionUri: vscode.Uri): void {
  if (current) {
    current.reveal();
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    VIEW_TYPE,
    'CodeRabbit Config',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      // The form holds edits that have not been written yet, and VS Code tears
      // a hidden webview down by default.
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist', 'webview')],
    },
  );

  panel.webview.html = buildHtml(panel.webview, extensionUri);
  panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
    void handleMessage(message);
  });
  panel.onDidDispose(() => {
    current = undefined;
  });

  current = panel;
}

async function handleMessage(message: WebviewMessage): Promise<void> {
  switch (message.type) {
    case 'copy':
      await vscode.env.clipboard.writeText(message.text);
      void vscode.window.showInformationMessage('Configuration copied to the clipboard.');
      return;
    case 'save':
      await saveConfig(message.text);
  }
}

async function saveConfig(text: string): Promise<void> {
  const folder = await pickWorkspaceFolder();
  if (!folder) return;

  const target = vscode.Uri.joinPath(folder.uri, CONFIG_FILENAME);
  if (await exists(target) && !await confirmOverwrite()) return;

  await vscode.workspace.fs.writeFile(target, Buffer.from(text, 'utf8'));
  // Showing the file is the confirmation that the write landed, and leaves the
  // user somewhere useful.
  await vscode.window.showTextDocument(
    await vscode.workspace.openTextDocument(target),
    { preview: false },
  );
}

async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) {
    void vscode.window.showErrorMessage(
      `Open a folder before saving ${CONFIG_FILENAME}.`,
    );
    return undefined;
  }
  if (folders.length === 1) return folders[0];
  return vscode.window.showWorkspaceFolderPick({
    placeHolder: `Where should ${CONFIG_FILENAME} be written?`,
  });
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  }
  catch {
    return false;
  }
}

async function confirmOverwrite(): Promise<boolean> {
  const choice = await vscode.window.showWarningMessage(
    `${CONFIG_FILENAME} already exists. Overwrite it?`,
    { modal: true },
    'Overwrite',
  );
  return choice === 'Overwrite';
}

function buildHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const root = vscode.Uri.joinPath(extensionUri, 'dist', 'webview');
  const script = webview.asWebviewUri(vscode.Uri.joinPath(root, 'webview.js'));
  const style = webview.asWebviewUri(vscode.Uri.joinPath(root, 'webview.css'));
  // Webviews reject inline scripts unless the CSP whitelists this exact nonce.
  const nonce = randomBytes(16).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';"
    />
    <link href="${style}" rel="stylesheet" />
    <title>CodeRabbit Config</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${script}"></script>
  </body>
</html>`;
}
