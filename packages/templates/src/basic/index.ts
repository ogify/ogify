import { defineTemplate, objectToStyle } from '@ogify/core';

export type TemplateParams = {
  title: string;
  subtitle?: string;
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
      layout = 'splitted',
      primaryColor = '#4c8f5f',
      secondaryColor = '#faf8f5',
      textColor = '#fff',
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

    let content = '';

    const titleContent = `<div class="text-[56px] font-bold leading-[1.4] flex flex-wrap w-full" style="${objectToStyle(
      {
        'text-wrap': 'pretty',
      }
    )}">${title}</div>`;

    const subtitleContent = subtitle
      ? `<p class="text-[28px] opacity-80 leading-[1.5] mt-6 flex flex-wrap w-full"  style="${objectToStyle(
          {
            'text-wrap': 'pretty',
          }
        )}">${subtitle}</p>`
      : '';

    if (layout === 'aligned') {
      content = `<div class="flex flex-col items-start justify-center h-full w-full px-24">
        ${brandLogo ? `<img class="mb-6 h-18" src="${brandLogo}" alt="${brandName}" />` : ''}

        ${titleContent}

        ${subtitleContent}

        <div class="mt-6 flex items-center">
          ${
            brandName
              ? `<div class="flex items-center rounded-full border border-white/40 bg-white/20 px-4 py-2 text-[24px] leading-none mr-6">
            <span class="h-2 w-2 rounded-full bg-white mr-2"></span>
            <span>${brandName}</span>
          </div>`
              : ''
          }
          <p class="text-[24px] opacity-60">${extras.filter(Boolean).join(' — ')}</p>
        </div>
      </div>`;
    } else if (layout === 'centered') {
      //
      content = `<div>
        
      </div>`;
    } else if (layout === 'splitted') {
      content = `<div class="flex h-full w-full">
        <div class="flex flex-col justify-center items-center w-1/3 p-16 border-r border-white/10">
          ${brandLogo ? `<img class="mb-6 h-24" src="${brandLogo}" alt="${brandName}" />` : ''}

          <p class="text-[24px] opacity-60">${extras.filter(Boolean).join(' — ')}</p>
        </div>
        <div class="flex flex-col justify-center w-2/3 p-16 items-start">
          ${
            brandName
              ? `<div class="flex items-center rounded-full border border-white/40 bg-white/20 px-4 py-2 text-[24px] leading-none mb-4">
              <span class="h-2 w-2 rounded-full bg-white mr-2"></span>
              <span>${brandName}</span>
            </div>`
              : ''
          }

          ${titleContent}

          ${subtitleContent}
        </div>
      </div>`;
    }

    return `<div class="flex h-full w-full" style="${objectToStyle(backgroundStyles, { isRTL })}">
              <div class="absolute flex inset-0 opacity-30" style="background-image: url(${pattern})"></div>
              ${content}
            </div>`;
  },
});

export default template;
