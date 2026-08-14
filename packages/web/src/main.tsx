import { PlatformProvider, Root } from '@coderabbit-config/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { webPlatform } from './platform/web';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider value={webPlatform}>
      <Root />
    </PlatformProvider>
  </StrictMode>,
);
