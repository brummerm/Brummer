import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// The fitness tracker is served under /apps/fitness/ on the production server.
// Vite's `base` makes built asset URLs use that prefix; React Router uses
// import.meta.env.BASE_URL to set its basename. See App.tsx.
const BASE = '/apps/fitness/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
  build: {
    // Drop the build straight into the FastAPI static dir so a single deploy step
    // can ship both server and frontend.
    outDir: path.resolve(__dirname, '../../server/static/fitness'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
