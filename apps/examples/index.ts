import { createTemplateHandler, defineTemplate, TemplateProps } from '@ogify/core';
import { writeFile } from 'node:fs/promises';

const template = defineTemplate({
  id: 'minimal',
  name: 'Minimal',
  description: 'A clean, minimal template for Open Graph images',
  schema: {
    title: {
      defaultValue: 'Title',
      required: true,
      type: 'string',
    },
    description: {
      defaultValue: 'Description',
      required: false,
      type: 'string',
    },
  },
  fonts: [
    {
      name: 'Roboto',
      urls: [
        'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.ttf',
        'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmbiA8.ttf',
        'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmXiA8.ttf',
      ],
      weight: 400,
      style: 'normal',
    },
    {
      name: 'StoryScript',
      urls: [
        'https://fonts.gstatic.com/s/storyscript/v3/mem5YaSw02SQ0OlzDuR8IskOUuhs.ttf',
        'https://fonts.gstatic.com/s/storyscript/v3/mem5YaSw02SQ0OlzDuR8IskOXehs.ttf',
      ],
      weight: 400,
      style: 'normal',
    },
  ],
  html: ({ params, fonts }: TemplateProps) => {
    const { title, description } = params;
    console.log(fonts);
    return `
      <div class="flex flex-col items-center justify-center w-full h-full bg-white text-black p-4">
        <h1 class="font-normal text-[50px] text-center mb-5 ${fonts.Roboto.className}">
          ${title}
        </h1>

        <p class="font-bold text-[50px] text-center opacity-80 leading-relaxed ${fonts.StoryScript.className}">
          ${description}
        </p>
        
        <p class="font-normal text-[50px] text-center opacity-80 leading-relaxed ${fonts.StoryScript.className}">
          ${description}
        </p>
      </div>
    `.trim();
  },
});

// Create a template handler with the built-in templates
const handler = createTemplateHandler({
  templates: [template],
});

async function main() {
  try {
    // Render the template to an image buffer
    try {
      const imageBuffer = await handler.renderToImage('minimal', {
        title:
          'Α α, Β β, Γ γ, Δ δ, Ε ε, Ζ ζ, Η η, Θ θ, Ι ι, Κ κCộng hòa xã hội <span class="font-bold">chủ nghĩa</span> việt nam',
        description: 'Ẳ Ấ Ố Ữ',
      });
      await writeFile('output.png', imageBuffer);
    } catch (error) {
      console.error('Error rendering image:', error);
    }
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

(async () => {
  await main();
})();
