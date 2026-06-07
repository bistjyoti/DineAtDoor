import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false
    },
    // Proxy only applies during local dev (vite dev server); ignored in production builds
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
