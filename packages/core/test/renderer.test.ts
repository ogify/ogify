import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateTemplate,
  defineTemplate,
  TemplateRenderer,
  createTemplateRenderer,
} from '../src/renderer';
import type { OgTemplate, OgTemplateRenderer } from '../src/types';
import * as templateModule from '../src/template';

// Mock the core renderTemplate function to avoid actual rendering
vi.mock('../src/template', () => ({
  renderTemplate: vi.fn(),
}));

describe('Renderer Module', () => {
  const mockTemplate: OgTemplate = {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template',
    renderer: () => '<div>Test</div>',
    fonts: [],
  };

  describe('validateTemplate', () => {
    it('should return true for valid template', () => {
      expect(validateTemplate(mockTemplate)).toBe(true);
    });

    it('should throw if id is missing', () => {
      const invalid = { ...mockTemplate, id: '' };
      expect(() => validateTemplate(invalid)).toThrow('Template must have an id');
    });

    it('should throw if name is missing', () => {
      const invalid = { ...mockTemplate, name: '' };
      expect(() => validateTemplate(invalid)).toThrow('Template must have a name');
    });

    it('should throw if renderer is missing', () => {
      const invalid = { ...mockTemplate } as any;
      delete invalid.renderer;
      expect(() => validateTemplate(invalid)).toThrow('Template must have a renderer function');
    });
  });

  describe('defineTemplate', () => {
    it('should return the template if valid', () => {
      const result = defineTemplate(mockTemplate);
      expect(result).toBe(mockTemplate);
    });

    it('should throw if template is invalid', () => {
      const invalid = { ...mockTemplate, id: '' };
      expect(() => defineTemplate(invalid)).toThrow();
    });
  });

  describe('TemplateRenderer', () => {
    let renderer: TemplateRenderer;
    const mockConfig: OgTemplateRenderer = {
      templates: [mockTemplate],
      defaultParams: { default: 'value' },
    };

    beforeEach(() => {
      vi.clearAllMocks();
      renderer = new TemplateRenderer(mockConfig);
    });

    it('should register templates on initialization', () => {
      expect(renderer.getTemplate('test-template')).toBe(mockTemplate);
    });

    it('should return undefined for unknown template', () => {
      expect(renderer.getTemplate('unknown')).toBeUndefined();
    });

    it('should return all template IDs', () => {
      expect(renderer.getTemplateIds()).toEqual(['test-template']);
    });

    describe('renderToImage', () => {
      it('should render successfully', async () => {
        const mockBuffer = Buffer.from('fake-image');
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const result = await renderer.renderToImage('test-template', {
          title: 'Hello',
        });

        expect(result).toBe(mockBuffer);
        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          mockTemplate,
          { default: 'value', title: 'Hello' },
          undefined
        );
      });

      it('should throw if template not found', async () => {
        await expect(renderer.renderToImage('unknown', {})).rejects.toThrow(
          "Template 'unknown' not found"
        );
      });

      it('should call lifecycle hooks', async () => {
        const beforeRender = vi.fn();
        const afterRender = vi.fn();
        const mockBuffer = Buffer.from('fake-image');
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const configWithHooks = {
          ...mockConfig,
          beforeRender,
          afterRender,
        };
        const rendererWithHooks = new TemplateRenderer(configWithHooks);

        await rendererWithHooks.renderToImage('test-template', { title: 'Hello' });

        expect(beforeRender).toHaveBeenCalledWith('test-template', {
          default: 'value',
          title: 'Hello',
        });
        expect(afterRender).toHaveBeenCalledWith(
          'test-template',
          { default: 'value', title: 'Hello' },
          mockBuffer
        );
      });

      it('should pass custom dimensions', async () => {
        const mockBuffer = Buffer.from('fake-image');
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        await renderer.renderToImage('test-template', {}, { width: 800, height: 400 });

        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          { width: 800, height: 400 }
        );
      });
    });
  });

  describe('createTemplateRenderer', () => {
    it('should create a new instance', () => {
      const instance = createTemplateRenderer({ templates: [] });
      expect(instance).toBeInstanceOf(TemplateRenderer);
    });
  });
});
