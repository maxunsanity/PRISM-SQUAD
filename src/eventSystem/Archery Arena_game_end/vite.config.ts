import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  base: '/event/archeryArena/',
  publicDir: 'public',
  server: { port: 5173, open: true },
  plugins: [react()],
  build: {
    outDir: '../../../public/event/archeryArena',
    emptyOutDir: true,
  },
});
