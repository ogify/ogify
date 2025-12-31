import { defineTemplate } from '@ogify/core';

export type TemplateParams = {
  logo: string;
  variant: 'dark' | 'light';
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
    const logo = params.logo || 'Untitled';
    const variant = params.variant || 'light';

    return `
      <div class="h-full w-full flex flex-col items-center justify-center p-20 bg-white">
        <h1 class="text-6xl font-bold text-gray-900">
          ${logo}
        </h1>
        <p class="text-2xl text-gray-600">
          ${variant}
        </p>
      </div>
    `;
  },
});

export default template;
