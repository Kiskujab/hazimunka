import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A "base: './'" a legfontosabb sor itt!
// Ez teszi relatívvá az összes útvonalat, hogy a GitHub Pages-en
// (ami egy almappában szolgálja ki az oldalt, pl. /hazimunka/) is működjön.
export default defineConfig({
  plugins: [react()],
  base: './',

  build: {
    // A Firebase SDK önmagában ~560 kB, ez normális.
    // Ezzel a sorral nem ír ki fordításkor ijesztő figyelmeztetést.
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        // A Firebase SDK-t külön fájlba tesszük. Így ha később
        // módosítod az app kódját, a látogatóknak nem kell újra
        // letölteniük a nagy Firebase csomagot – gyorsabb betöltés.
        manualChunks(id) {
          if (id.includes('firebase')) return 'firebase'
        },
      },
    },
  },
})
