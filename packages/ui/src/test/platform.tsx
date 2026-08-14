import type { ReactNode } from 'react';
import { PlatformProvider } from '../platform/context';
import type { PlatformAdapter } from '../platform/types';

// The real adapters live in the host packages, so tests here run against an
// inert one and assert against the calls it records.
const stubPlatform: PlatformAdapter = {
  save: async () => {},
  copy: async () => {},
  saveLabel: 'Download',
  canToggleTheme: true,
};

export function createTestPlatform(
  overrides: Partial<PlatformAdapter> = {},
): PlatformAdapter {
  return { ...stubPlatform, ...overrides };
}

// RTL `wrapper` that supplies the platform every UI component expects.
export function withPlatform(platform: PlatformAdapter = stubPlatform) {
  return ({ children }: { children: ReactNode }) => (
    <PlatformProvider value={platform}>{children}</PlatformProvider>
  );
}
