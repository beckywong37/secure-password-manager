// GenAI Citation for April:
// Portions of this code related to static file serving were generated with the help of Cursor with
// Claude-4.5-sonnet model.
// The conversation transcript linked below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_16_Cursor_fixing_deploy_issues.md

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/static/',  // Prepend /static/ to all asset URLs in production
  server: {
    proxy: {
      // Proxy API requests to Django backend during development. only active when running pnpm dev
      '/generator/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Generate manifest.json with mappings like "index.js": "index-<hash>.js"
    manifest: 'manifest.json',  // Place manifest.json at root of outDir, not in .vite/
    // Build to dist/, Django collectstatic will copy to STATIC_ROOT
    outDir: path.resolve(__dirname, 'dist'), 
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
})
