import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      output: {
        // Keep each format as a single entry file so CJS doesn't rely on .js chunks
        // inside a "type": "module" package.
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**/*'],
      outDir: 'dist',
    }),
  ],
});
