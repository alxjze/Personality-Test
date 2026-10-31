import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// In development the PHP API runs on :8080 (php -S); Vite proxies /api to it so
// frontend and backend share one origin, exactly like production (psikologia.id + /api).
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_API_PROXY ?? 'http://127.0.0.1:8080', changeOrigin: false },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
