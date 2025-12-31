import rtlCSSJS from 'rtl-css-js';

export const objectToStyle = (
  style: Record<string, string | number | undefined | null> | undefined | null,
  options?: {
    isRTL?: boolean;
  }
): string => {
  if (!style) {
    return '';
  }

  const { isRTL = false } = options || {};

  return Object.entries(isRTL ? rtlCSSJS(style) : style)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (value || value === 0) {
        const cssKey = key.startsWith('--')
          ? key
          : key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

        return `${cssKey}:${value}`;
      }
      return '';
    })
    .filter(Boolean)
    .join(';');
};
