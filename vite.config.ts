import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // FORCE INJECT THE KEY to bypass environment loading issues
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify("AIzaSyAZC0liaclaPGGi96fphY-q4thoTSwLSN0")
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
