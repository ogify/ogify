import { defineTemplate, objectToStyle } from '@ogify/core';

export type TemplateParams = {
  title: string;
  subtitle: string;
  brandName?: string;
  brandLogo?: string;
  extras?: string[];

  layout?: 'aligned' | 'centered' | 'splitted';
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  pattern?: string;
};

const template = defineTemplate<TemplateParams>({
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
  renderer: (props) => {
    const { params, isRTL } = props;
    const {
      title,
      subtitle,
      brandName = '',
      brandLogo = '',
      layout = 'aligned',
      primaryColor = '#4c8f5f',
      secondaryColor = '#000',
      textColor = '#ffffff',
      extras = [],
      pattern = 'https://www.transparenttextures.com/patterns/cubes.png',
    } = params;

    const backgroundStyles = {
      background: `radial-gradient(at 0% 0%, ${primaryColor} 0px, transparent 50%),
                   radial-gradient(at 100% 0%, ${secondaryColor} 0px, transparent 50%),
                   radial-gradient(at 100% 100%, ${primaryColor} 0px, transparent 50%),
                   radial-gradient(at 0% 100%, ${secondaryColor} 0px, transparent 50%)`,
      backgroundColor: primaryColor,
      color: textColor,
    };

    if (layout === 'aligned') {
      return `<div class="flex flex-col items-start justify-center h-full w-full px-24" style="${objectToStyle(backgroundStyles, { isRTL })}">
          <div class="absolute flex inset-0 opacity-30" style="background-image: url(${pattern})"></div>

          ${brandLogo ? `<img class="mb-6 h-18" src="${brandLogo}" alt="${brandName}" />` : ''}

          <h1 class="mb-6 text-[56px] font-bold">${title}</h1>

          <p class="mb-6 text-[32px] opacity-80">${subtitle}</p>

          <div class="mt-6 flex items-center">
            <div class="flex items-center rounded-full border border-white/40 bg-white/20 px-4 py-2 text-[24px] leading-none">
              <span class="h-2 w-2 rounded-full bg-white mr-2"></span>
              <span>${brandName}</span>
            </div>
            <p class="ml-6 text-[24px] opacity-60">${extras.filter(Boolean).join(' — ')}</p>
          </div>
          
        </div>`;
    }

    if (layout === 'centered') {
      // LEFT_ALIGNED
      return `<div></div>`;
    }

    if (layout === 'splitted') {
      // SPLIT
      return `<div></div>`;
    }

    return `<div></div>`;
  },
});

export default template;
