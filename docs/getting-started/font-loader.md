# Font Loader

OGify handles font loading for you, making it easy to use Google Fonts or custom font files.

## Google Fonts (Zero-Config)

To use a Google Font, simply specify its name and weight in your template definition. OGify acts as a proxy to fetch the font file automatically.

```typescript
const template = defineTemplate({
  fonts: [
    { name: 'Inter', weight: 400 },
    { name: 'Inter', weight: 700 },
    { name: 'Roboto Mono', weight: 400, style: 'italic' }
  ],
  // ...
});
```

## Custom Fonts (URL)

You can load a font from any public URL.

```typescript
const template = defineTemplate({
  fonts: [
    { 
      name: 'MyCustomFont',
      url: 'https://example.com/fonts/my-font.woff',
      weight: 600
    }
  ],
  // ...
});
```

## Local/Buffer Fonts

If you have the font file loaded as a buffer (e.g., read from the filesystem), you can pass it directly.

```typescript
import { readFileSync } from 'fs';

const fontData = readFileSync('./fonts/MyFont.ttf');

const template = defineTemplate({
  fonts: [
    { 
      name: 'MyLocalFont',
      data: fontData,
      weight: 700
    }
  ],
  // ...
});
```

## Rendering with Fonts

Once defined, apply the font in your CSS using the `font-family` property (or rely on the default if it's the first one).

```typescript
renderer: ({ params }) => `
  <div style="font-family: 'Inter', sans-serif;">
    Hello World
  </div>
`
```
