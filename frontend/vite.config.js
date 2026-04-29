import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['.onrender.com', 'local-connect-4.onrender.com'],
  },
  preview: {
    host: true,
    allowedHosts: ['.onrender.com', 'local-connect-4.onrender.com'],
  }
})
