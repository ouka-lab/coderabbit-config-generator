import { useForm } from '@formisch/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AnyForm } from '../form/formisch';
import type { ChangeSignal } from '../form/useChangeSignal';
import type { PlatformAdapter } from '../platform/types';
import { buildRootSchema, type JSONSchema } from '@coderabbit-config/core';
import { createTestPlatform, withPlatform } from '../test/platform';
import { YamlPreview } from './YamlPreview';

const schema = buildRootSchema({
  type: 'object',
  properties: {
    language: { enum: ['en-US', 'ja-JP'], default: 'en-US' },
    early_access: { type: 'boolean', default: false },
  },
} as JSONSchema);

const signal: ChangeSignal = {
  emit: () => {},
  subscribe: () => () => {},
  getSnapshot: () => 0,
};

function renderPreview(platform?: PlatformAdapter) {
  function Harness() {
    const form = useForm({ schema }) as AnyForm;
    return <YamlPreview form={form} signal={signal} />;
  }
  return render(<Harness />, { wrapper: withPlatform(platform) });
}

describe('YamlPreview', () => {
  it('shows the Red Hat modeline by default', () => {
    renderPreview();
    expect(screen.getByText(/yaml-language-server/)).toBeInTheDocument();
  });

  it('drops the modeline and shows the placeholder when disabled', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(
      screen.getByRole('checkbox', { name: /YAML Language Support/ }),
    );
    expect(screen.queryByText(/yaml-language-server/)).not.toBeInTheDocument();
    expect(screen.getByText(/No overrides yet/)).toBeInTheDocument();
  });

  it('renders defaults when "Include default values" is checked', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(
      screen.getByRole('checkbox', { name: /Include default values/ }),
    );
    expect(screen.getByText(/language: en-US/)).toBeInTheDocument();
  });

  it('delegates copy and save to the platform', async () => {
    const user = userEvent.setup();
    const copy = vi.fn().mockResolvedValue(undefined);
    const save = vi.fn().mockResolvedValue(undefined);
    renderPreview(createTestPlatform({ copy, save }));

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(screen.getByRole('button', { name: 'Download' }));

    const expected = expect.stringContaining('yaml-language-server');
    expect(copy).toHaveBeenCalledWith(expected);
    expect(save).toHaveBeenCalledWith(expected);
  });

  it('labels the save button the way the platform asks', () => {
    renderPreview(createTestPlatform({ saveLabel: 'Save to workspace' }));
    expect(
      screen.getByRole('button', { name: 'Save to workspace' }),
    ).toBeInTheDocument();
  });

  it('exposes the extension link inside the tip', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(
      screen.getByRole('button', { name: /About YAML Language Support/ }),
    );
    expect(
      screen.getByRole('link', { name: /YAML Language Support by Red Hat/ }),
    ).toHaveAttribute('href', expect.stringContaining('redhat.vscode-yaml'));
  });
});
