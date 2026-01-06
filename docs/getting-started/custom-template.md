# Custom Templates

While OGify comes with production-ready templates, you may want to create your own to match your brand's unique identity.

## `defineTemplate`

The `defineTemplate` helper is the core building block. It ensures type safety and provides a structure for your template.

```typescript
import { defineTemplate } from '@ogify/core';

export type MyTemplateParams = {
  title: string;
  description: string;
};

const myTemplate = defineTemplate<MyTemplateParams>({
  // 1. Define Fonts
  fonts: [
    { name: 'Inter', weight: 400 },
    { name: 'Inter', weight: 700 }
  ],
  
  // 2. Define Renderer Function
  renderer: ({ params, isRTL }) => {
    // Return HTML string
    return `
      <div style="display: flex; width: 100%; height: 100%; background: white;">
        <h1>${params.title}</h1>
      </div>
    `;
  },
  
  // 3. (Optional) Custom Emoji provider
  emojiProvider: 'twemoji'
});
```

## Styling

We use [Satori](https://github.com/vercel/satori) under the hood, which supports a subset of CSS properties. For a complete list of supported CSS features, see [Template Features](./template-features.md).

### Inline Styles

You can simply write inline styles in your HTML string.

```typescript
<div style="color: red; font-size: 48px;">Title</div>
```

### Tailwind-like Classes

OGify's renderer passes the HTML through a processor that understands basic Tailwind-like utility classes (e.g., `flex`, `p-4`, `text-center`, `bg-blue-500`).

```typescript
<div class="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white">
  ...
</div>
```

> **Note**: Not all Tailwind classes are supported. It essentially maps common utility classes to inline styles for Satori.

## Dynamic Content

Your renderer function receives `params` which contains whatever data you pass during `renderToImage`. Use this to inject titles, images, dates, etc.

## Best Practices

- **Keep it simple**: Satori is powerful but has some limitations compared to a full browser engine. Avoid complex CSS selectors or deeply nested absolute positioning if possible.
- **Use `display: flex`**: Flexbox is the most reliable way to layout content in Satori.
- **Test with `isRTL`**: Ensure your template handles RTL content gracefully if you plan to support international audiences.

## See Also

- [Template Features](./template-features.md) - Complete list of supported CSS properties
- [Font Loader](./font-loader.md) - Using Google Fonts or custom fonts
- [Emoji Loader](./emoji-loader.md) - Rendering emojis in your templates
- [RTL Support](./rtl.md) - Right-to-left language support
- [Core API Reference](../api-reference/core.md) - Full API documentation
