import { describe, expect, it, vi } from 'vitest';
import { createVscodePlatform } from './platform';

const YAML = 'early_access: true\n';

describe('createVscodePlatform', () => {
  it('posts save and copy to the extension host', async () => {
    const post = vi.fn();
    const platform = createVscodePlatform(post);

    await platform.save(YAML);
    await platform.copy(YAML);

    expect(post).toHaveBeenNthCalledWith(1, { type: 'save', text: YAML });
    expect(post).toHaveBeenNthCalledWith(2, { type: 'copy', text: YAML });
  });

  it('hides the theme toggle, since VS Code owns the theme', () => {
    expect(createVscodePlatform(vi.fn()).canToggleTheme).toBe(false);
  });

  it('labels the save button for a workspace write, not a download', () => {
    expect(createVscodePlatform(vi.fn()).saveLabel).toBe('Save to workspace');
  });
});
