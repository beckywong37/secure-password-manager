import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to Django backend during development. only active when running pnp m dev
      '/generator/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Generate manifest.json with mappings like "index.js": "index-<hash>.js"
    manifest: true,
    // Points to Django static output directory
    outDir: path.resolve(__dirname, '../../password_manager/static/'), 
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
})
