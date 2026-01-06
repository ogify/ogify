# Next.js Pages Router Integration

For Next.js projects using the Pages Router, generate OG images using **API Routes**.

> Ensure you have [installed the packages](../getting-started/installation.md) before proceeding.

## Using API Routes

### 1. Create the API Route

Create a file at `pages/api/og.ts`:

```typescript
import { createRenderer } from '@ogify/core';
import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';
import type { NextApiRequest, NextApiResponse } from 'next';

const renderer = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title } = req.query;

  const imageBuffer = await renderer.renderToImage('basic', {
    title: (title as string) || 'Hello World',
    layout: 'centered',
  });

  res.setHeader('Content-Type', 'image/png');
  // See [Caching](../getting-started/cache.md) for strategy configuration
  res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
  res.send(imageBuffer);
}
```

## Usage in Pages

In your pages, point the `og:image` meta tag to your API route.

```tsx
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>My Page</title>
        <meta property="og:image" content="/api/og?title=My Page" />
        <meta name="twitter:image" content="/api/og?title=My Page" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1>My Page</h1>
    </>
  );
}
```
