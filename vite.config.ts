import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        '@urbit/aura',
        '@urbit/nockjs',
        'any-ascii',
        'big-integer',
        'browser-or-node',
        'date-fns',
        'emoji-regex',
        'exponential-backoff',
        'libphonenumber-js',
        'sorted-btree',
        'uuid',
        // Note: lodash and validator are bundled (not external) for ESM/CJS compatibility
      ],
    },
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
    }),
  ],
});
