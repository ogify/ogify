// Core exports for OGify
export * from './types';
export * from './template';
export * from './utils';
export * from './renderer';

// Re-export commonly used functions
export { createTemplateHandler } from './template';

// Export generateOGLink as a standalone function
export function generateOGLink(
  templateId: string,
  params: Record<string, any> = {},
  options: {
    baseUrl?: string;
    defaults?: Record<string, any>;
  } = {}
): string {
  const baseUrl = options.baseUrl || '/api/og';
  const mergedParams = {
    template: templateId,
    ...options.defaults,
    ...params,
  };

  const queryString = new URLSearchParams(mergedParams).toString();
  return `${baseUrl}?${queryString}`;
}
