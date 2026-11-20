import { defineConfig } from 'vite'

// Bundles the API into one CommonJS file for Azure Static Web Apps managed functions, so the
// deployment needs no npm install. api-template/ supplies host.json and function.json.
export default defineConfig({
  publicDir: 'api-template',
  build: {
    ssr: 'server/functions.ts',
    outDir: 'api-dist',
    emptyOutDir: true,
    target: 'node20',
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    rollupOptions: {
      output: { entryFileNames: 'course/index.js', format: 'cjs' },
    },
  },
  ssr: { noExternal: true, target: 'node' },
})
