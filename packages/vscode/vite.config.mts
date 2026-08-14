import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist/webview',
    emptyOutDir: true,
    // The webview's CSP allows stylesheets only from disk, so the CSS has to
    // land as its own file instead of being injected by the bundle at runtime.
    cssCodeSplit: false,
    rollupOptions: {
      input: 'webview/main.tsx',
      output: {
        // A webview loads one classic script under a CSP nonce, and the
        // extension references these filenames literally, so keep the bundle
        // single-file and the names stable.
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'webview.js',
        assetFileNames: 'webview.[ext]',
      },
    },
  },
});
