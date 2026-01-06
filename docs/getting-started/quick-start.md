# Quick Start

This guide will walk you through generating your first Open Graph image using OGify.

## 1. Import a Template

OGify comes with a set of ready-to-use templates. For this guide, we'll use the `basic` template.

```typescript
import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';
```

## 2. Create a Renderer

The renderer is responsible for orchestrating the generation process. passing the template to the renderer.

```typescript
import { createRenderer } from '@ogify/core';

const renderer = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
  // Optional: Shared parameters across all templates
  sharedParams: {
    brandName: 'My Brand',
    brandLogo: 'https://ogify.dev/logo.svg',
  }
});
```

## 3. Generate an Image

Now you can generate an image by calling `renderToImage`. This returns a PNG buffer that you can serve in your response or save to disk.

```typescript
const imageBuffer = await renderer.renderToImage('basic', {
  title: 'Hello World',
  subtitle: 'My first dynamically generated OG image',
  layout: 'centered',
  cta: 'Read More',
  primaryColor: '#000000',
});
```

## 4. Saving/Returning the Image

You can save the image to a file or return it as a response.

### Saving to a File

```typescript
import { writeFile } from 'node:fs/promises';

await writeFile('output.png', imageBuffer);
```

### Returning as a Response

```typescript
import { NextResponse } from 'next/server';

return new NextResponse(imageBuffer, {
  headers: {
    'Content-Type': 'image/png',
  },
});
```

## Next Steps

- Explore the [API Reference](../api-reference/core.md) to learn more about configuration options.
- Check out the [Templates](../api-reference/templates.md) to see available designs.
- See integration guides for [Next.js App Router](../recipes/nextjs-app-router.md) and [Pages Router](../recipes/nextjs-page-router.md).
