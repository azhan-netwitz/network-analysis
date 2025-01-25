import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wifi-network-analyzer/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
