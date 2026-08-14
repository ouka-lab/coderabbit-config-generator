import { createContext, useContext } from 'react';
import type { PlatformAdapter } from './types';

const PlatformContext = createContext<PlatformAdapter | null>(null);

export const PlatformProvider = PlatformContext.Provider;

export function usePlatform(): PlatformAdapter {
  const platform = useContext(PlatformContext);
  if (!platform) {
    throw new Error('usePlatform must be called inside a PlatformProvider');
  }
  return platform;
}
