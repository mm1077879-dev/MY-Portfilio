import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const hmrEnabled = process.env.DISABLE_HMR !== 'true';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    cacheDir: 'node_modules/.vite',
    resolve: {
      alias: {
        '@': projectRoot,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      ws: hmrEnabled
        ? {
            host: 'localhost',
            protocol: 'ws',
            clientPort: 3000,
          }
        : undefined,
      watch: hmrEnabled ? {} : undefined,
    },
  };
});
