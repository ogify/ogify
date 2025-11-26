import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ['zod', 'satori', '@resvg/resvg-js'],
  treeshake: true,
  target: 'node18.0',
});
