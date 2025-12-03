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
  fonts: [
    {
      name: 'Roboto',
      url: 'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.ttf',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'RobotoFallback1',
      url: 'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmbiA8.ttf',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'RobotoFallback2',
      url: 'https://fonts.gstatic.com/s/roboto/v49/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmXiA8.ttf',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'StoryScript',
      url: 'https://fonts.gstatic.com/s/storyscript/v3/mem5YaSw02SQ0OlzDuR8IskOUuhs.ttf',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'StoryScriptFallback',
      url: 'https://fonts.gstatic.com/s/storyscript/v3/mem5YaSw02SQ0OlzDuR8IskOXehs.ttf',
      weight: 400,
      style: 'normal',
    },
  ],
  html: ({ params }: TemplateProps) => {
    const { title, description } = params;
    return `
      <div class="flex flex-col items-center justify-center w-full h-full bg-white text-black font-sans p-4">
        <h1 style="font-family: Roboto, RobotoFallback1, RobotoFallback2" class="text-[50px] font-bold text-center mb-5">
          ${title}
        </h1>
        
        <p style="font-family: StoryScript, StoryScriptFallback" class="text-[50px] font-light text-center opacity-80 leading-relaxed">
          ${description}
        </p>
      </div>
    `.trim();
  },
});
