# Emoji Loader

OGify supports rendering emojis in your images by downloading vector or image assets from open-source emoji providers.

## Configuration

You can specify the `emojiProvider` when defining a template or via global library configuration (if available). Currently, it is set per template.

```typescript
const template = defineTemplate({
  // ...
  emojiProvider: 'twemoji', // Default
  renderer: ...
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
