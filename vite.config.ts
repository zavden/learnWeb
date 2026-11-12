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
