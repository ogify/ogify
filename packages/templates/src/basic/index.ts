import { defineTemplate, objectToStyle, clsx } from '@ogify/core';

export type TemplateParams = {
  title: string;
  subtitle?: string;
  brandName?: string;
  brandLogo?: string;
  cta?: string;
  extras?: string[];

  layout?: 'aligned' | 'centered' | 'split';
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

    const titleContent = `<div class="${clsx(subtitle ? 'text-[56px]' : 'text-[64px]', 'w-full font-bold leading-[1.25] flex flex-wrap', isRTL ? 'justify-end' : 'justify-start')}" style="${objectToStyle({ 'text-wrap': 'pretty' })}">${title}</div>`;

    const subtitleContent = subtitle ? `<p class="${clsx('w-full text-[28px] opacity-80 leading-[1.5] mt-6 flex flex-wrap', isRTL ? 'justify-end' : 'justify-start')}"  style="${objectToStyle({ 'text-wrap': 'pretty' })}">${subtitle}</p>` : '';

    const ctaContent = cta
      ? `<div class="text-[24px] py-4 px-8 mt-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
        ${isRTL ? `<svg class="w-6 h-6 mr-4" viewBox="0 0 640 640"><path fill="currentColor" d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"/></svg>` : ''}
        ${cta}
        ${isRTL ? '' : '<svg class="w-6 h-6 ml-4" viewBox="0 0 640 640"><path fill="currentColor" d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z"/></svg>'}
      </div>`
      : '';

    if (layout === 'aligned') {
      content = `<div class="${clsx('flex flex-col justify-center h-full w-full px-24', isRTL ? 'items-end text-right' : 'items-start text-left')}">
        ${brandLogo ? `<img class="mb-6 h-18" src="${brandLogo}" alt="${brandName}" />` : ''}
        ${titleContent}
        ${subtitleContent}
        <div class="${clsx('mt-6 flex items-center justify-between w-full', isRTL ? 'flex-row-reverse' : 'flex-row')}">
          <div class="${clsx('flex flex-col', isRTL ? 'items-end text-right' : 'items-start text-left')}">
            ${brandName ? `<div class="flex text-[24px] mb-2"> ${brandName}</div>` : ''}
            <div class="${clsx('flex text-[20px] opacity-60', isRTL ? 'flex-row-reverse' : 'flex-row')}">${extras.filter(Boolean).map((extra) => `<span>${extra}</span>`).join('<span class="mx-2">•</span>')}</div>
          </div>
          ${ctaContent}
        </div>
      </div>`;
    } else if (layout === 'centered') {
      content = `<div class="flex flex-col items-center justify-center h-full w-full px-24 text-center">
        ${brandLogo ? `<img class="mb-6 h-24" src="${brandLogo}" alt="${brandName}" />` : ''}
        ${titleContent}
        ${subtitleContent}
        ${ctaContent}
        <div class="${clsx('flex items-center justify-center w-full mt-6', isRTL ? 'flex-row-reverse' : 'flex-row')}">
          ${brandName ? `<div class="flex text-[24px] mx-4"> ${brandName}</div>` : ''}
          <div class="${clsx('flex text-[20px] opacity-60', isRTL ? 'flex-row-reverse' : 'flex-row')}">${extras.filter(Boolean).map((extra) => `<span>${extra}</span>`).join('<span class="mx-2">•</span>')}</div>
        </div>
      </div>`;
    } else if (layout === 'split') {
      content = `<div class="${clsx('flex h-full w-full', isRTL ? 'flex-row-reverse' : 'flex-row')}">
        <div class="flex flex-col justify-center items-center text-center w-1/3 p-16 ${isRTL ? 'border-l' : 'border-r'} border-white/10">
          ${brandLogo ? `<img class="mb-6 h-24" src="${brandLogo}" alt="${brandName}" />` : ''}
          ${brandName ? `<div class="flex text-[24px] mb-4"> ${brandName}</div>` : ''}
          <div class="${clsx('flex flex-col text-[20px] justify-center items-center opacity-60')}">${extras.filter(Boolean).map((extra) => `<span>${extra}</span>`).join('<span class="my-2"></span>')}</div>
        </div>
        <div class="${clsx('flex flex-col justify-center w-2/3 p-16 items-center', isRTL ? 'border-r items-end text-right' : 'border-l items-start text-left')}">
          ${titleContent}
          ${subtitleContent}
          ${ctaContent}
        </div>
      </div>`;
    }

    return `<div class="flex h-full w-full" style="${objectToStyle(backgroundStyles)}"><div class="absolute flex inset-0 opacity-30" style="${objectToStyle({ backgroundImage: `url(${pattern})` })}"></div>${content}</div>`;
  },
});

export default template;
