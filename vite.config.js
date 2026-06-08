import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Redam deprecation warning dari dependency (Bootstrap)
        quietDeps: true,
        silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
      },
    },
  },
  server: {
    port: 5173,
    // Proxy ke backend Go saat development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
