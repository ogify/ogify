import { describe, it, expect } from 'vitest';
import { objectToStyle } from '../src/utils/object-to-style';

describe('objectToStyle', () => {
  it('should return empty string for undefined or null', () => {
    expect(objectToStyle(undefined)).toBe('');
    // @ts-ignore
    expect(objectToStyle(null)).toBe('');
  });

  it('should return empty string for empty object', () => {
    expect(objectToStyle({})).toBe('');
  });

  it('should convert simple object to style string', () => {
    const style = { color: 'red', display: 'flex' };
    expect(objectToStyle(style)).toBe('color:red;display:flex');
  });

  it('should convert camelCase keys to kebab-case', () => {
    const style = { backgroundColor: 'red', fontSize: '16px', lineHeight: 1.5 };
    expect(objectToStyle(style)).toBe('background-color:red;font-size:16px;line-height:1.5');
  });

  it('should ignore undefined, null, or empty string values', () => {
    const style = {
      color: 'red',
      backgroundColor: undefined,
      fontSize: null,
      display: '',
    };
    expect(objectToStyle(style)).toBe('color:red');
  });

  it('should handle numbers', () => {
    const style = { opacity: 0.5, zIndex: 100 };
    expect(objectToStyle(style)).toBe('opacity:0.5;z-index:100');
  });

  it('should NOT convert CSS variables', () => {
    const style = { '--bg-color': 'red', color: 'var(--bg-color)' };
    expect(objectToStyle(style)).toBe('--bg-color:red;color:var(--bg-color)');
  });

  it('should remove keys with falsy values but keep 0', () => {
    const style = {
      display: false,
      opacity: 0,
      margin: 0,
      padding: '',
      flex: null,
      color: undefined,
      // @ts-ignore
      visibility: false,
    };
    // @ts-ignore
    expect(objectToStyle(style)).toBe('opacity:0;margin:0');
  });
});
