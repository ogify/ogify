import { defineTemplate } from '@ogify/core';

export type TemplateParams = {
  title: string;
  description: string;
};

const template = defineTemplate<TemplateParams>({
  fonts: [
    {
      name: 'Inter',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Inter',
      weight: 700,
      style: 'normal',
    },
  ],
  renderer: (props) => {
    const { params } = props;
    const title = params.title || 'Untitled';
    const description = params.description || '';

    return `
      <div class="h-full w-full flex flex-col items-center justify-center p-20 bg-white">
        <h1 class="text-6xl font-bold text-gray-900">
          ${title}
        </h1>
        <p class="text-2xl text-gray-600">
          ${description}
        </p>
      </div>
    `;
  },
});

export default template;
