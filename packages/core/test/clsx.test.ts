import { describe, it, expect } from 'vitest';
import { clsx } from '../src/utils/clsx';

describe('clsx', () => {
  it('should join string classes', () => {
    expect(clsx('foo', 'bar')).toBe('foo bar');
  });

  it('should ignore falsy values', () => {
    expect(clsx('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('should support conditional object syntax', () => {
    expect(clsx({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should support arrays', () => {
    expect(clsx(['foo', ['bar', 'baz']])).toBe('foo bar baz');
  });

  it('should support numbers', () => {
    expect(clsx('text-[', 56, 'px]')).toBe('text-[ 56 px]');
  });
});
