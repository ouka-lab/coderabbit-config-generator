import { buildZip } from '../output/zip';
import type { PlatformAdapter } from './types';

// Browsers strip the leading dot from download filenames (both <a download>
// and the File System Access picker sanitize suggested names), so a dotfile
// cannot be saved directly. Ship a ZIP whose entry keeps the exact name.
export function downloadYaml(
  text: string,
  entryName = '.coderabbit.yaml',
  zipName = 'coderabbit-config.zip',
) {
  const bytes = buildZip(entryName, text);
  const blob = new Blob([bytes as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const webPlatform: PlatformAdapter = {
  save: async (text) => {
    downloadYaml(text);
  },
  copy: text => navigator.clipboard.writeText(text),
  saveLabel: 'Download',
  saveTitle:
    'Downloads coderabbit-config.zip containing .coderabbit.yaml — browsers cannot save dotfiles directly',
  canToggleTheme: true,
};
