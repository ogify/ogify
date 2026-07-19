import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    node: 'src/node.ts',
    wasm: 'src/wasm.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  // Keep Resvg packages and the .wasm binary as external imports so consumer
  // bundlers (Wrangler, Vite, webpack) can resolve / precompile them.
  external: [
    'satori',
    'satori-html',
    '@resvg/resvg-js',
    '@resvg/resvg-wasm',
    '@resvg/resvg-wasm/index_bg.wasm',
    'lru-cache',
    'react',
  ],
  treeshake: true,
  target: 'es2022',
  platform: 'neutral',
});
