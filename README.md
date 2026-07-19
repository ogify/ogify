# OGify - Generate beautiful OG images in minutes

[![npm version](https://badge.fury.io/js/%40ogify%2Fcore.svg)](https://badge.fury.io/js/%40ogify%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Zero-config dynamic Open Graph images for Next.js, Nuxt, Remix, and more. Just copy & paste the production-ready templates.

![OGify](https://assets.ogify.dev/preview.png)

## ⚡ Why OGify?

- 🔌 **Zero-config**: Works out of the box with Next.js, Remix, Nuxt, and more.
- 🔤 **Hassle-free assets**: Just specify a Google Font name, Emoji provider - no downloads, no font files, no hassle.
- 🎨 **Flexible Customization**: Intuitive API & Tailwind-like syntax helps building eye-catching templates faster.
- 🖼️ **Production-ready templates**: OGify provides a set of production-ready templates with zero configuration.
- ⚡ **Smart caching**: Automatically caches fonts, emojis, and generated images - no configuration required.
- 🌍 **RTL Support**: Built-in support for Right-to-Left languages like Arabic, Hebrew, and Persian.

## 📚 Documentation

- 🌐 **[Website](https://ogify.dev)** - Official website
- 🎨 **[Template Gallery](https://ogify.dev/templates)** - Browse all available templates
- 📖 **[Documentation](https://docs.ogify.dev)** - Complete guides and API reference

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built on top of:

- [satori](https://github.com/vercel/satori) - SVG generation
- [satori-html](https://github.com/vercel/satori-html) - HTML to VDOM conversion
- [@resvg/resvg-js](https://github.com/thx/resvg-js) - SVG to PNG (Node.js / Vercel Serverless)
- [@resvg/resvg-wasm](https://github.com/thx/resvg-js) - SVG to PNG (Cloudflare Workers / Vercel Edge)
- [lru-cache](https://github.com/isaacs/node-lru-cache) - LRU cache

## Platform support

Transparent by default: omit `resvg` and `@ogify/core` detects the runtime and loads the right backend. Pass `resvg` only to override.

| Runtime | Auto backend | Override (optional) |
|---|---|---|
| Node.js / Vercel Serverless | `@resvg/resvg-js` | `createNodeResvg()` from `@ogify/core/node` |
| Cloudflare Workers / Pages | `@resvg/resvg-wasm` (+ package `.wasm` asset) | `createWasmResvg(wasm)` from `@ogify/core/wasm` |
| Vercel Edge | `@resvg/resvg-wasm` (+ package `.wasm` asset) | same as Workers |

```ts
import { createRenderer } from '@ogify/core';

// Works on Node, Cloudflare Workers, and Vercel Edge — no resvg wiring needed
const renderer = createRenderer({
  templates: { /* ... */ },
  cache: { type: 'memory' },
});
```

```ts
// Optional explicit override
import { createRenderer } from '@ogify/core';
import { createNodeResvg } from '@ogify/core/node';

const renderer = createRenderer({
  templates: { /* ... */ },
  resvg: createNodeResvg(),
});
```

On Cloudflare Workers, your bundler must support `.wasm` imports from dependencies (Wrangler does). Use `cache: { type: 'memory' }` on Workers / Edge (`filesystem` is Node-only).
