import { createRenderer } from '@ogify/core';
import { writeFile } from 'node:fs/promises';

import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';

// Create a template handler with the built-in templates
const handler = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
  cache: {
    type: 'memory',
  },
  sharedParams: {},
});

const variants = [
  {
    layout: 'aligned',
    isRTL: false,
  },
  {
    layout: 'centered',
    isRTL: false,
  },
  {
    layout: 'split',
    isRTL: false,
  },
  {
    layout: 'aligned',
    isRTL: true,
  },
  {
    layout: 'centered',
    isRTL: true,
  },
  {
    layout: 'split',
    isRTL: true,
  },
];

async function main() {
  for (const variant of variants) {
    try {
      const start = Date.now();
      console.log(`Generating ${variant.layout} ${variant.isRTL ? 'rtl' : 'ltr'} image...`);
      const imageBuffer = await handler.renderToImage(
        'basic',
        {
          title: 'Generate beautiful OG images in minutes',
          subtitle: 'Zero-config dynamic Open Graph images for Next.js, Nuxt, Remix, and more. Just copy & paste the production-ready templates.',
          brandLogo: 'https://ogify.dev/logo.svg',
          brandName: '@ogify',
          extras: ['#zero-config', '#production-ready'],
          cta: 'Get started',
          layout: variant.layout as TemplateParams['layout'],
        },
        {
          isRTL: variant.isRTL,
          fonts: [
            {
              name: 'JetBrains Mono',
              weight: 400,
              style: 'normal',
            },
            {
              name: 'JetBrains Mono',
              weight: 700,
              style: 'normal',
            },
          ],
        }
      );
      await writeFile(
        `outputs/${variant.layout}-${variant.isRTL ? 'rtl' : 'ltr'}.png`,
        imageBuffer
      );
      const end = Date.now();
      console.log(
        `Generated ${variant.layout} ${variant.isRTL ? 'rtl' : 'ltr'} image successfully... ${end - start}ms`
      );
    } catch (error) {
      console.error(`❌ Example failed: ${variant.layout} ${variant.isRTL ? 'rtl' : 'ltr'}`, error);
    }
  }
}

(async () => {
  await main();
})();
