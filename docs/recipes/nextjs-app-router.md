# Next.js App Router Integration

Next.js App Router provides two distinct ways to generate Open Graph images: using File Conventions (`opengraph-image.tsx`) or using Route Handlers.

> Ensure you have [installed the packages](../getting-started/installation.md) before proceeding.

## Option 1: File Conventions (Recommended)

Next.js has built-in support for generating images using `opengraph-image.tsx`. This maps directly to OGify's renderer.

### 1. Create `opengraph-image.tsx`

Place this file in any route segment (e.g., `app/opengraph-image.tsx` or `app/posts/[slug]/opengraph-image.tsx`).

```typescript
import { ImageResponse } from 'next/og';
import { createRenderer } from '@ogify/core';
import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';

// Configure the renderer (outside the handler for caching)
const renderer = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
});

export const runtime = 'edge';

export const alt = 'About Acme';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Generate the image buffer
  const buffer = await renderer.renderToImage('basic', {
    title: 'My Page Title',
    subtitle: 'Generated via opengraph-image.tsx',
    layout: 'centered',
  });

  // Return the buffer as a Response
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
```

> **Note**: While Next.js provides `ImageResponse`, OGify returns a standard Buffer, which you can simply return in a standard `Response` object.

## Option 2: Route Handlers

If you need a dynamic endpoint (e.g., `/api/og?title=...`) that enables you to generate images on demand for various pages, use a Route Handler.

### 1. Create the Route Handler

Create `app/api/og/route.ts`:

```typescript
import { createRenderer } from '@ogify/core';
import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';
import { NextResponse } from 'next/server';

const renderer = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Hello Next.js';

  const imageBuffer = await renderer.renderToImage('basic', {
    title,
    layout: 'centered',
  });

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      // Cache for 1 hour (See [Caching](../getting-started/cache.md) for specifics)
      'Cache-Control': 'public, max-age=3600, immutable',
    },
  });
}
```

### 2. Use in Metadata

```typescript
// app/page.tsx
export const metadata = {
  openGraph: {
    images: ['/api/og?title=My Page Title'],
  },
};
```
