import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,       // Ensure it runs on port 5173
    watch: {
      usePolling: true
    }
  }
})
