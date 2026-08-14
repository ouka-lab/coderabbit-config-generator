import type { ReactNode } from 'react';
import { PlatformProvider } from '../platform/context';
import type { PlatformAdapter } from '../platform/types';
import { webPlatform } from '../platform/web';

export function createTestPlatform(
  overrides: Partial<PlatformAdapter> = {},
): PlatformAdapter {
  return { ...webPlatform, ...overrides };
}

// RTL `wrapper` that supplies the platform every UI component expects.
export function withPlatform(platform: PlatformAdapter = webPlatform) {
  return ({ children }: { children: ReactNode }) => (
    <PlatformProvider value={platform}>{children}</PlatformProvider>
  );
}
