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

async function main() {
  try {
    try {
      const imageBuffer = await handler.renderToImage(
        'basic',
        {
          title: 'Generate beautiful OG images in minutes',
          subtitle:
            'Zero-config dynamic Open Graph images for Next.js, Nuxt, Remix, and more. Just copy & paste the production-ready templates.',
          brandLogo: 'https://ogify.dev/logo.svg',
          brandName: 'Ogify',
          extras: ['ogify.dev'],
        },
        {
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
      await writeFile('output.png', imageBuffer);
    } catch (error) {
      console.error('Error rendering image:', error);
    }
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

(async () => {
  console.log('Example started...');
  const start = Date.now();
  await main();
  const end = Date.now();
  console.log(`Example 1 finished in ${end - start}ms`);

  await main();
  const finish = Date.now();
  console.log(`Example 2 finished in ${finish - end}ms`);
})();
