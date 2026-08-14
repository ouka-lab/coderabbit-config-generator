import { afterEach, describe, expect, it, vi } from 'vitest';
import { syncVscodeTheme } from './theme';

const isDark = () => document.documentElement.classList.contains('dark');

let stop: (() => void) | undefined;

afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.className = '';
  document.documentElement.className = '';
});

describe('syncVscodeTheme', () => {
  it('mirrors a dark VS Code theme onto <html>', () => {
    document.body.classList.add('vscode-dark');
    stop = syncVscodeTheme();
    expect(isDark()).toBe(true);
  });

  it('treats the dark high contrast theme as dark', () => {
    document.body.classList.add('vscode-high-contrast');
    stop = syncVscodeTheme();
    expect(isDark()).toBe(true);
  });

  it('leaves <html> light for the light high contrast theme', () => {
    document.body.classList.add('vscode-high-contrast-light');
    stop = syncVscodeTheme();
    expect(isDark()).toBe(false);
  });

  it('follows a theme switch after mounting', async () => {
    document.body.classList.add('vscode-light');
    stop = syncVscodeTheme();
    expect(isDark()).toBe(false);

    document.body.classList.replace('vscode-light', 'vscode-dark');

    await vi.waitFor(() => {
      expect(isDark()).toBe(true);
    });
  });

  it('stops following once disposed', async () => {
    document.body.classList.add('vscode-light');
    const dispose = syncVscodeTheme();
    dispose();

    document.body.classList.replace('vscode-light', 'vscode-dark');
    await Promise.resolve();

    expect(isDark()).toBe(false);
  });
});
