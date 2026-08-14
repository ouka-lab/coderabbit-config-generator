import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Root } from './Root';
import { withPlatform } from './test/platform';

describe('Root', () => {
  it('shows the form by default', () => {
    render(<Root />, { wrapper: withPlatform() });
    expect(screen.getByRole('button', { name: 'Import Configure' })).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('navigates to the import page and back', async () => {
    const user = userEvent.setup();
    render(<Root />, { wrapper: withPlatform() });

    await user.click(screen.getByRole('button', { name: 'Import Configure' }));
    expect(screen.getByPlaceholderText('Paste your .coderabbit.yaml here')).toBeInTheDocument();
    expect(screen.queryByText('General')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('imports a config and reflects it back on the form', async () => {
    const user = userEvent.setup();
    render(<Root />, { wrapper: withPlatform() });

    await user.click(screen.getByRole('button', { name: 'Import Configure' }));
    await user.type(
      screen.getByPlaceholderText('Paste your .coderabbit.yaml here'),
      'language: ja-JP',
    );
    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(screen.getByText('General')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Include default values'));
    expect(screen.getByText(/language: ja-JP/)).toBeInTheDocument();
  });
});
