import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // localhost → 127.0.0.1(IPv4)만 쓰는 브라우저에서도 접속되도록 0.0.0.0 바인딩
  server: { port: 5176, host: true },
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
