import * as vscode from 'vscode';
import { showConfigPanel } from './panel';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('coderabbitConfig.open', () => {
      showConfigPanel(context.extensionUri);
    }),
  );
}

export function deactivate(): void {
  // Nothing to clean up: the panel disposes itself with the extension host.
}
