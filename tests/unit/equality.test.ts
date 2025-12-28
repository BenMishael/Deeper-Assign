/**
 * Unit tests for equality utilities
 */

import { describe, it, expect } from 'vitest';
import { deepEqual, deepClone } from '../../public/ts/utils/equality';

describe('deepEqual', () => {
  describe('primitives', () => {
    it('should handle identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('test', 'test')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('should handle different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('test', 'other')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('should handle different types', () => {
      expect(deepEqual(1, '1')).toBe(false);
      expect(deepEqual(true, 1)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should handle identical arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    it('should handle different arrays', () => {
      expect(deepEqual([1, 2], [1, 3])).toBe(false);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should handle nested arrays', () => {
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
      expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false);
    });
  });

  describe('objects', () => {
    it('should handle identical objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('should handle different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('should handle nested objects', () => {
      expect(deepEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 1 } } }
      )).toBe(true);
      
      expect(deepEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } }
      )).toBe(false);
    });

    it('should handle objects with different key counts', () => {
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });

  describe('complex structures', () => {
    it('should handle publisher config-like objects', () => {
      const config1 = {
        publisherId: 'pub-001',
        aliasName: 'Test',
        isActive: true,
        pages: [{ pageType: 'home', selector: '#main', position: 'top' }],
      };
      
      const config2 = {
        publisherId: 'pub-001',
        aliasName: 'Test',
        isActive: true,
        pages: [{ pageType: 'home', selector: '#main', position: 'top' }],
      };
      
      expect(deepEqual(config1, config2)).toBe(true);
    });

    it('should detect differences in nested arrays within objects', () => {
      const config1 = {
        pages: [{ pageType: 'home' }],
      };
      
      const config2 = {
        pages: [{ pageType: 'article' }],
      };
      
      expect(deepEqual(config1, config2)).toBe(false);
    });
  });
});

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('test')).toBe('test');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);
    
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr); // Different reference
  });

  it('should clone nested arrays', () => {
    const arr = [[1, 2], [3, 4]];
    const cloned = deepClone(arr);
    
    expect(cloned).toEqual(arr);
    expect(cloned[0]).not.toBe(arr[0]); // Nested arrays also cloned
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: 2 };
    const cloned = deepClone(obj);
    
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should clone nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    const cloned = deepClone(obj);
    
    expect(cloned).toEqual(obj);
    expect(cloned.a).not.toBe(obj.a);
    expect(cloned.a.b).not.toBe(obj.a.b);
  });

  it('should clone dates', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    
    expect(cloned.getTime()).toBe(date.getTime());
    expect(cloned).not.toBe(date);
  });

  it('should clone complex publisher config', () => {
    const config = {
      publisherId: 'pub-001',
      aliasName: 'Test',
      isActive: true,
      pages: [
        { pageType: 'home', selector: '#main', position: 'top' },
        { pageType: 'article', selector: '.content', position: 'bottom' },
      ],
      tags: ['tech', 'news'],
    };
    
    const cloned = deepClone(config);
    
    expect(cloned).toEqual(config);
    expect(cloned).not.toBe(config);
    expect(cloned.pages).not.toBe(config.pages);
    expect(cloned.tags).not.toBe(config.tags);
    
    // Mutations don't affect original
    cloned.pages[0].pageType = 'changed';
    expect(config.pages[0].pageType).toBe('home');
  });
});

