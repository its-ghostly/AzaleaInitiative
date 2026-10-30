import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Local/API builds use `/`. GitHub Pages sets VITE_BASE=/AzaleaInitiative/
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})
