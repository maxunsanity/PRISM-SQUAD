import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // zip 업로드·상대 경로 배포 — index.html과 같은 폴더 기준으로 assets/tables 로드
  base: './',
  server: {
    port: 5180,
    host: '127.0.0.1',
    strictPort: true,
    open: true,
  },
  preview: {
    port: 5180,
    host: '127.0.0.1',
    strictPort: true,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react':  ['react', 'react-dom'],
        },
      },
    },
  },
})
