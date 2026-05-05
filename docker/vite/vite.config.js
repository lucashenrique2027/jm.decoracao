import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './frontend',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // Garante que ele não mude de porta se a 5173 estiver ocupada
    hmr: {
      // Aqui está o segredo:
      clientPort: 80, // Ou 443 se estiver usando HTTPS. É a porta que você digita no browser.
      host: 'localhost', // O domínio que você usa no browser para acessar o site
    },
    watch: {
      usePolling: true, // Necessário dentro de volumes Docker no Windows/Mac
      interval: 1000    // Aumentamos para 1s para não fritar o CPU
    }
  },
  plugins: [react()],
})