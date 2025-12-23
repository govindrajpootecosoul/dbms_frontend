import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy not needed for deployed backend; keep empty to avoid localhost usage
    proxy: {},
  },
})

