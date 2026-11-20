import { defineConfig } from 'vite'

// Bundles the local development server (npm run start:mock) into one file.
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
