import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadYaml, webPlatform } from './web';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('downloadYaml', () => {
  it('downloads a zip archive via an anchor click', () => {
    const anchors: HTMLAnchorElement[] = [];
    let blob: Blob | undefined;
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (tag === 'a') {
        el.click = vi.fn();
        anchors.push(el as HTMLAnchorElement);
      }
      return el;
    });
    vi.stubGlobal('URL', {
      createObjectURL: (b: Blob) => {
        blob = b;
        return 'blob:x';
      },
      revokeObjectURL: () => {},
    });

    downloadYaml('early_access: true\n');

    expect(anchors).toHaveLength(1);
    expect(anchors[0].download).toBe('coderabbit-config.zip');
    expect(anchors[0].click).toHaveBeenCalled();
    expect(blob?.type).toBe('application/zip');
  });
});

describe('webPlatform', () => {
  it('copies through the clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await webPlatform.copy('early_access: true\n');

    expect(writeText).toHaveBeenCalledWith('early_access: true\n');
  });

  it('lets the app own its theme', () => {
    expect(webPlatform.canToggleTheme).toBe(true);
  });
});
