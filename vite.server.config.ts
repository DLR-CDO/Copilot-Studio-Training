import { defineConfig } from 'vite'

// Bundles the Node server and its dependencies into one file, so App Service needs no npm install.
export default defineConfig({
  publicDir: false,
  build: {
    ssr: 'server/index.ts',
    outDir: 'server-dist',
    emptyOutDir: true,
    target: 'node22',
    rollupOptions: {
      output: { entryFileNames: 'index.mjs', format: 'es' },
    },
  },
  ssr: { noExternal: true, target: 'node' },
})
