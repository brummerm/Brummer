import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const BASE = '/apps/grades/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
  build: {
    outDir: path.resolve(__dirname, '../../server/static/grades'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
