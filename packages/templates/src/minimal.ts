import { defineTemplate, TemplateProps } from '@ogify/core';

/**
 * Minimal template definition
 */
export const minimalTemplate = defineTemplate({
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
  html: ({ params }: TemplateProps) => {
    const { title, description } = params;
    return `
      <div style="font-family: Inter" class="flex flex-col items-center justify-center w-full h-full bg-white text-black font-sans p-4">
        <h1 class="text-[100px] font-bold text-center mb-5">
          ${title}
        </h1>
        
        <p class="text-[50px] font-light text-center opacity-80 leading-relaxed">
          ${description}
        </p>
      </div>
    `.trim();
  },
});
