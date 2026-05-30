import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
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

    // Ye proxy sirf local development ke liye hai
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Deployment ke liye backend URL define kar rahe hain
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
      ? 'https://tera-vercel-backend-link.vercel.app' 
      : 'http://localhost:4000'
    )
  },

  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})