import { defineTemplate, objectToStyle } from '@ogify/core';

export type TemplateParams = {
  title: string;
  subtitle?: string;
  brandName?: string;
  brandLogo?: string;
  cta?: string;
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
      cta = '',
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

    const titleContent = `<div class="${subtitle ? 'text-[56px]' : 'text-[64px]'} font-bold leading-[1.25] flex flex-wrap w-full" style="${objectToStyle(
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

    const ctaContent = cta
      ? `<div class="text-[24px] py-4 px-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
      ${cta}
      <svg class="w-[24px] h-[24px] ml-4" viewBox="0 0 640 640"><path fill="currentColor" d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z"/></svg>
      </div>`
      : '';

    if (layout === 'aligned') {
      content = `<div class="flex flex-col items-start justify-center h-full w-full px-24">
        ${brandLogo ? `<img class="mb-6 h-18" src="${brandLogo}" alt="${brandName}" />` : ''}

        ${titleContent}

        ${subtitleContent}

        <div class="mt-6 flex items-center justify-between w-full">
          <div class="flex flex-col">
            ${
              brandName
                ? `<div class="flex items-center rounded-full border border-white/40 bg-white/20 px-4 py-2 text-[24px] leading-none mr-6">
              <span class="h-2 w-2 rounded-full bg-white mr-2"></span>
              <span>${brandName}</span>
            </div>`
                : ''
            }
            <p class="text-[24px] opacity-60">${extras.filter(Boolean).join(' • ')}</p>
          </div>
          ${ctaContent}
        </div>
      </div>`;
    } else if (layout === 'centered') {
      //
      content = `<div class="flex flex-col items-center justify-center h-full w-full px-24 text-center">
        ${brandLogo ? `<img class="mb-6 h-24" src="${brandLogo}" alt="${brandName}" />` : ''}

        ${titleContent}

        ${subtitleContent}

        <div class="mt-6 flex">${ctaContent}</div>

        <p class="text-[24px] opacity-60 mt-6">${[brandName, ...extras].filter(Boolean).join(' • ')}</p>
      </div>`;
    } else if (layout === 'splitted') {
      content = `<div class="flex h-full w-full">
        <div class="flex flex-col justify-center items-center w-1/3 p-16 border-r border-white/10">
          ${brandLogo ? `<img class="mb-6 h-24" src="${brandLogo}" alt="${brandName}" />` : ''}

          <div class="flex items-center text-[32px] mb-6">
            ${brandName}
          </div>

          <p class="text-[24px] opacity-60">${extras.filter(Boolean).join(' — ')}</p>\
        </div>
        <div class="flex flex-col justify-center w-2/3 p-16 items-start">
          ${titleContent}

          ${subtitleContent}

          <div class="mt-6 flex">${ctaContent}</div>
        </div>
      </div>`;
    }

    return `<div class="flex h-full w-full" style="${objectToStyle(backgroundStyles, { isRTL })}">
              <div class="absolute flex inset-0 opacity-30"  style="${objectToStyle({ 'background-image': `url(${pattern})` }, { isRTL })}"></div>
              ${content}
            </div>`;
  },
});

export default template;
