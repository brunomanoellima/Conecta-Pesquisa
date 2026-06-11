import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // <--- ADICIONE ESTA LINHA AQUI
    port: 5173  // (Opcional) Garante que a porta seja sempre essa
  }
})