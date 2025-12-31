import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'minimalism/index': 'src/minimalism/index.ts',
    'basic/index': 'src/basic/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', '@ogify/core'],
});
