import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(packageDir, 'dist');

async function collectModuleGraph(entryName) {
  const seen = new Set();
  const sources = [];

  async function visit(fileName) {
    if (seen.has(fileName)) return;
    seen.add(fileName);

    const source = await readFile(resolve(distDir, fileName), 'utf8');
    sources.push(source);

    const localImports = source.matchAll(/from ['"]\.\/([^'"]+\.mjs)['"]/g);
    for (const match of localImports) {
      await visit(match[1]);
    }
  }

  await visit(entryName);
  return sources.join('\n');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const [nodeGraph, cloudflareGraph, vercelGraph, packageJson, declarations] = await Promise.all([
  collectModuleGraph('index.mjs'),
  collectModuleGraph('index.cloudflare.mjs'),
  collectModuleGraph('index.vercel.mjs'),
  readFile(resolve(packageDir, 'package.json'), 'utf8').then(JSON.parse),
  readFile(resolve(distDir, 'index.d.ts'), 'utf8'),
]);

assert(nodeGraph.includes('@resvg/resvg-js'), 'Node entry must include @resvg/resvg-js');
assert(!nodeGraph.includes('@resvg/resvg-wasm'), 'Node entry must not include the WASM backend');

assert(
  cloudflareGraph.includes("@resvg/resvg-wasm/index_bg.wasm'"),
  'Cloudflare entry must use a plain static WASM import'
);
assert(
  !cloudflareGraph.includes('@resvg/resvg-js'),
  'Cloudflare entry must not include native Node bindings'
);

assert(
  vercelGraph.includes('@resvg/resvg-wasm/index_bg.wasm?module'),
  'Vercel Edge entry must use the ?module WASM import'
);
assert(
  !vercelGraph.includes('@resvg/resvg-js'),
  'Vercel Edge entry must not include native Node bindings'
);

assert(
  packageJson.exports['.'].workerd === './dist/index.cloudflare.mjs',
  'The workerd condition must select the Cloudflare entry'
);
assert(
  packageJson.exports['.']['edge-light'] === './dist/index.vercel.mjs',
  'The edge-light condition must select the Vercel entry'
);
assert(
  declarations.includes('Promise<Buffer>'),
  'Public declarations must preserve the Promise<Buffer> API'
);

console.log('Platform build verification passed');
