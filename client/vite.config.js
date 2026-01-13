import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment (matches your repo name)
  base: process.env.GITHUB_PAGES ? '/BitBucketWrapper/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        timeout: 300000, // 5 minute timeout for large scans
        proxyTimeout: 300000
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
