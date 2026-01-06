# Emoji Loader

OGify supports rendering emojis in your images by downloading vector or image assets from open-source emoji providers.

## Configuration

You can specify the `emojiProvider` when defining a template. It is set per template during template definition.

```typescript
import { defineTemplate } from '@ogify/core';

const template = defineTemplate({
  fonts: [
    { name: 'Inter', weight: 400 },
  ],
  emojiProvider: 'twemoji', // Default
  renderer: ({ params }) => {
    return `<div>${params.title}</div>`;
  },
});
```

### Supported Providers

- `'twemoji'`: Twitter Emojis (Default).
- `'fluent'`: Microsoft Fluent Emojis.
- `'fluentFlat'`: Microsoft Fluent Emojis (Flat variant).
- `'noto'`: Google Noto Emojis.
- `'blobmoji'`: Blobmojis.
- `'openmoji'`: OpenMoji.

## Usage

Simply include the emoji character in your string content. The renderer will automatically detect it and replace it with the corresponding image asset during generation.

```typescript
renderer: ({ params }) => `
  <div>
    <h1>${params.title}</h1> <!-- If title contains "👋", it will be rendered -->
    <p>🎉 🚀 ✨</p>
  </div>
`
```

## Performance

Emoji assets are cached automatically by the renderer's cache system to ensure subsequent uses are fast.
