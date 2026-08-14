import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PlatformProvider } from './platform/context';
import { webPlatform } from './platform/web';
import { Root } from './Root';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider value={webPlatform}>
      <Root />
    </PlatformProvider>
  </StrictMode>,
);
