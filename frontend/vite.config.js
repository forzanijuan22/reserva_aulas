import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CORRECCIÓN: Habilitar el host para red local
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  }
})