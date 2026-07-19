import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateTemplate,
  defineTemplate,
  TemplateRenderer,
  createRenderer,
} from '../src/renderer';
import type { OgTemplate, OgTemplateRenderer } from '../src/types';
import * as templateModule from '../src/template';

// Mock the core renderTemplate function to avoid actual rendering
vi.mock('../src/template', () => ({
  renderTemplate: vi.fn(),
}));

describe('Renderer Module', () => {
  const mockTemplate: OgTemplate = {
    renderer: () => '<div>Test</div>',
    fonts: [],
  };

  describe('validateTemplate', () => {
    it('should return true for valid template', () => {
      expect(validateTemplate(mockTemplate)).toBe(true);
    });

    // id validation is removed from core types
    // the previous test 'should throw if id is missing' is no longer relevant

    it('should throw if renderer is missing', () => {
      const invalid = { ...mockTemplate } as any;
      delete invalid.renderer;
      expect(() => validateTemplate(invalid)).toThrow('Template must have a renderer function');
    });

    it('should throw if fonts array is missing', () => {
      const invalid = { ...mockTemplate } as any;
      delete invalid.fonts;
      expect(() => validateTemplate(invalid)).toThrow('Template must have a fonts array');
    });
  });

  describe('defineTemplate', () => {
    it('should return the template if valid', () => {
      const result = defineTemplate(mockTemplate);
      expect(result).toBe(mockTemplate);
    });

    // id validation is removed
    it('should throw if template is invalid', () => {
      const invalid = { ...mockTemplate } as any;
      delete invalid.renderer;
      expect(() => defineTemplate(invalid)).toThrow();
    });
  });

  describe('TemplateRenderer', () => {
    let renderer: TemplateRenderer;
    const mockConfig: OgTemplateRenderer = {
      templates: { 'test-template': mockTemplate },
      sharedParams: { default: 'value' },
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

    // getTemplateIds method was removed or does not exist
    // it('should return all template IDs', () => {
    //   expect(renderer.getTemplateIds()).toEqual(['test-template']);
    // });

    describe('renderToImage', () => {
      it('should render successfully', async () => {
        const mockBuffer = new Uint8Array([1, 2, 3]);
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const result = await renderer.renderToImage('test-template', {
          title: 'Hello',
        });

        expect(result).toBe(mockBuffer);
        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          mockTemplate,
          { default: 'value', title: 'Hello' },
          expect.objectContaining({ resvg: undefined })
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
        const mockBuffer = new Uint8Array([9, 9, 9]);
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
        const mockBuffer = new Uint8Array([1]);
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        await renderer.renderToImage('test-template', {}, { width: 800, height: 400 });

        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ width: 800, height: 400 })
        );
      });

      it('should accept params as a function returning a promise', async () => {
        const mockBuffer = new Uint8Array([2]);
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const paramsFn = vi.fn().mockResolvedValue({ title: 'Async Title' });
        const result = await renderer.renderToImage('test-template', paramsFn);

        expect(result).toBe(mockBuffer);
        expect(paramsFn).toHaveBeenCalled();
        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          mockTemplate,
          { default: 'value', title: 'Async Title' },
          expect.objectContaining({ resvg: undefined })
        );
      });

      it('should accept sharedParams as a function returning a promise', async () => {
        const mockBuffer = new Uint8Array([3]);
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const asyncSharedConfig: OgTemplateRenderer = {
          ...mockConfig,
          sharedParams: async () => ({ default: 'async-value' }),
        };
        const asyncRenderer = new TemplateRenderer(asyncSharedConfig);

        await asyncRenderer.renderToImage('test-template', { title: 'Hello' });

        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          mockTemplate,
          { default: 'async-value', title: 'Hello' },
          expect.objectContaining({ resvg: undefined })
        );
      });

      it('should pass renderer-level resvg backend to renderTemplate', async () => {
        const mockBuffer = new Uint8Array([4]);
        const resvg = { render: vi.fn() };
        vi.mocked(templateModule.renderTemplate).mockResolvedValue(mockBuffer);

        const withResvg = new TemplateRenderer({
          templates: mockConfig.templates,
          sharedParams: mockConfig.sharedParams,
          resvg: resvg as any,
        });

        await withResvg.renderToImage('test-template', { title: 'Hello' });

        expect(templateModule.renderTemplate).toHaveBeenCalledWith(
          mockTemplate,
          expect.anything(),
          expect.objectContaining({ resvg })
        );
      });
    });
  });

  describe('createRenderer', () => {
    it('should create a new instance', () => {
      const instance = createRenderer({ templates: {} });
      expect(instance).toBeInstanceOf(TemplateRenderer);
    });
  });
});
