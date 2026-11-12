// Vite configuration for the dev server (`npm run dev`, port 5174) and the production build.
//
// The app is served by Vite and the API by server.ts on 127.0.0.1:3001; the proxy below makes `/api`
// same-origin for the app. Nothing else is configured: the sources are TypeScript and Vite compiles
// them directly (the type checking is `npm run typecheck`, not part of the build).

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    // No CORS middleware in the dev server: the app is same-origin, and preview pages (other
    // origins, or "null" in sandboxed srcdoc copies) must reach the API through the proxy, whose
    // server sets its own CORS headers (assets, /api/demo). Vite's middleware would answer their
    // preflights itself and refuse the "null" origin.
    cors: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
