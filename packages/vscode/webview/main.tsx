import { PlatformProvider, Root } from '@coderabbit-config/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { WebviewMessage } from '../src/messages';
import './index.css';
import { createVscodePlatform } from './platform';
import { syncVscodeTheme } from './theme';

declare function acquireVsCodeApi(): {
  postMessage: (message: WebviewMessage) => void;
};

const api = acquireVsCodeApi();
syncVscodeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider value={createVscodePlatform(message => api.postMessage(message))}>
      <Root />
    </PlatformProvider>
  </StrictMode>,
);
