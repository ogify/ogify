import { createTemplateRenderer, defineTemplate, OgTemplateOptions } from '@ogify/core';
import { writeFile } from 'node:fs/promises';

const template = defineTemplate({
  id: 'minimal',
  name: 'Minimal',
  description: 'A clean, minimal template for Open Graph images',
  fonts: [
    {
      name: 'Roboto',
      weight: 400,
    },
    {
      name: 'Roboto',
      weight: 700,
    },
    {
      name: 'Merriweather',
    },
  ],
  renderer: ({ params }: OgTemplateOptions) => {
    const { title, description } = params;
    return `
      <div class="flex flex-col items-center justify-center w-full h-full bg-white text-black p-4">
        <div style="font-family: Roboto" class="flex text-[50px] text-center mb-5">
          ${title}
        </div>

        <div class="flex text-[50px] text-center mb-5">
          👋 😄 🎉 🎄 🦋
        </div>
        
        <div style="font-family: Merriweather" class="flex font-normal text-[50px] text-center opacity-80 leading-relaxed">
          ${description}
        </div>
      </div>
    `.trim();
  },
});

// Create a template handler with the built-in templates
const handler = createTemplateRenderer({
  templates: [template],
  cache: {
    type: 'memory',
  },
});

async function main() {
  try {
    // Render the template to an image buffer
    try {
      const imageBuffer = await handler.renderToImage(
        'minimal',
        {
          title: 'Cộng hòa xã hội chủ nghĩa Việt Nam',
          description: 'Độc lập - Tự do - Hạnh phúc',
        },
        { width: 1200, height: 675 }
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
  console.log(`Example ended in ${end - start}ms`);

  await main();
  const finish = Date.now();
  console.log(`Example finished in ${finish - end}ms`);
})();
