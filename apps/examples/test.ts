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
    const start = Date.now();
    console.log(`Generating image...`);
    const imageBuffer = await handler.renderToImage(
      'basic',
      {
        title: 'مرحبا بالعالم',
        subtitle: 'دليل شامل لتطوير الويب الحديث',
        layout: 'aligned',
        brandName: 'مدونة تقنية',
        cta: 'قراءة المقال',
        extras: ['5 دقائق للقراءة', 'تطوير الويب الحديث'],
        brandLogo: 'https://ogify.dev/white-logo.svg',
      },
      {
        isRTL: true,
        fonts: [{
          name: 'Beiruti',
          weight: 400,
        },
        {
          name: 'Beiruti',
          weight: 700,
        }]
      }
    );
    await writeFile(
      `outputs/test.png`,
      imageBuffer
    );
    const end = Date.now();
    console.log(
      `Generated image successfully... ${end - start}ms`
    );
  } catch (error) {
    console.error(`❌ Example failed: ${error}`);
  }
}

(async () => {
  await main();
})();
