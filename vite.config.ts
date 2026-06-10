import { defineConfig } from 'vite'

// Declare lightweight module stubs so TypeScript doesn't require full node typings in this workspace
declare module 'url'
declare module 'path'

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = (fileURLToPath as any)(import.meta.url)
const __dirname = (dirname as any)(__filename)

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        catalogo: resolve(__dirname, 'src/pages/catalogo.html'),
        detalle:  resolve(__dirname, 'src/pages/detalle.html'),
        admin:    resolve(__dirname, 'src/pages/admin.html'),
      }
    }
  }
})