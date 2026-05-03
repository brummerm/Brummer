import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const BASE = '/apps/travel-planner/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
  build: {
    outDir: path.resolve(__dirname, '../../server/static/travel-planner'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
