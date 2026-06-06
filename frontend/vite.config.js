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
    // local testing ke liye proxy thik hai, par production par use nahi hogi
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // 🔥 YAHAN HUMNE TERA LIVE RAILWAY BACKEND LINK SET KAR DIYA!
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://dineatdoor-production.up.railway.app' // Tera asli live backend URL!
        : 'http://localhost:4000'
    )
  },

  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})