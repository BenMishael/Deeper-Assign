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

  describe('Date objects', () => {
    it('should return true for Dates with same time', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:00.000Z');
      expect(deepEqual(date1, date2)).toBe(true);
    });

    it('should return false for Dates with different time', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-02T00:00:00.000Z');
      expect(deepEqual(date1, date2)).toBe(false);
    });

    it('should return false when comparing Date to non-Date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const str = '2024-01-01T00:00:00.000Z';
      const num = date.getTime();
      
      expect(deepEqual(date, str)).toBe(false);
      expect(deepEqual(date, num)).toBe(false);
      expect(deepEqual(date, {})).toBe(false);
      expect(deepEqual(date, null)).toBe(false);
    });

    it('should handle Dates in nested structures', () => {
      const obj1 = {
        created: new Date('2024-01-01'),
        nested: { updated: new Date('2024-01-02') }
      };
      const obj2 = {
        created: new Date('2024-01-01'),
        nested: { updated: new Date('2024-01-02') }
      };
      const obj3 = {
        created: new Date('2024-01-01'),
        nested: { updated: new Date('2024-01-03') }
      };
      
      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });
  });

  describe('NaN handling', () => {
    it('should return true for NaN === NaN', () => {
      expect(deepEqual(NaN, NaN)).toBe(true);
    });

    it('should return false when comparing NaN to non-NaN', () => {
      expect(deepEqual(NaN, 0)).toBe(false);
      expect(deepEqual(NaN, undefined)).toBe(false);
      expect(deepEqual(NaN, null)).toBe(false);
      expect(deepEqual(NaN, 'NaN')).toBe(false);
    });

    it('should handle NaN in arrays', () => {
      expect(deepEqual([1, NaN, 3], [1, NaN, 3])).toBe(true);
      expect(deepEqual([1, NaN, 3], [1, 0, 3])).toBe(false);
    });

    it('should handle NaN in objects', () => {
      expect(deepEqual({ a: NaN }, { a: NaN })).toBe(true);
      expect(deepEqual({ a: NaN }, { a: 0 })).toBe(false);
    });
  });

  describe('circular references', () => {
    it('should handle circular object references', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 1 };
      obj2.self = obj2;
      
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should handle circular array references', () => {
      const arr1: any[] = [1, 2];
      arr1.push(arr1);
      
      const arr2: any[] = [1, 2];
      arr2.push(arr2);
      
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it('should detect differences in circular structures', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 2 };
      obj2.self = obj2;
      
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle complex nested circular references', () => {
      const obj1: any = { a: { b: 1 } };
      obj1.a.parent = obj1;
      
      const obj2: any = { a: { b: 1 } };
      obj2.a.parent = obj2;
      
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should handle mixed circular references', () => {
      const obj1: any = { arr: [1, 2] };
      obj1.arr.push(obj1);
      
      const obj2: any = { arr: [1, 2] };
      obj2.arr.push(obj2);
      
      expect(deepEqual(obj1, obj2)).toBe(true);
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

  describe('circular references', () => {
    it('should handle circular object references', () => {
      const obj: any = { a: 1, b: 2 };
      obj.self = obj;
      
      const cloned = deepClone(obj);
      
      expect(cloned.a).toBe(1);
      expect(cloned.b).toBe(2);
      expect(cloned.self).toBe(cloned); // Self-reference preserved
      expect(cloned).not.toBe(obj); // Different object
    });

    it('should handle circular array references', () => {
      const arr: any[] = [1, 2, 3];
      arr.push(arr);
      
      const cloned = deepClone(arr);
      
      expect(cloned[0]).toBe(1);
      expect(cloned[1]).toBe(2);
      expect(cloned[2]).toBe(3);
      expect(cloned[3]).toBe(cloned); // Self-reference preserved
      expect(cloned).not.toBe(arr); // Different array
    });

    it('should handle complex nested circular references', () => {
      const obj: any = {
        name: 'root',
        child: {
          name: 'child',
          parent: null as any
        }
      };
      obj.child.parent = obj;
      
      const cloned = deepClone(obj);
      
      expect(cloned.name).toBe('root');
      expect(cloned.child.name).toBe('child');
      expect(cloned.child.parent).toBe(cloned); // Circular ref preserved
      expect(cloned).not.toBe(obj);
      expect(cloned.child).not.toBe(obj.child);
    });

    it('should handle multiple references to same object', () => {
      const shared = { value: 42 };
      const obj = {
        ref1: shared,
        ref2: shared,
      };
      
      const cloned = deepClone(obj);
      
      expect(cloned.ref1).toBe(cloned.ref2); // Same reference preserved
      expect(cloned.ref1).not.toBe(shared); // But cloned
      expect(cloned.ref1.value).toBe(42);
      
      // Mutation affects both refs in clone
      cloned.ref1.value = 100;
      expect(cloned.ref2.value).toBe(100);
      
      // But not the original
      expect(shared.value).toBe(42);
    });
  });

  describe('Date cloning', () => {
    it('should clone Date objects correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const cloned = deepClone(date);
      
      expect(cloned).toBeInstanceOf(Date);
      expect(cloned.getTime()).toBe(date.getTime());
      expect(cloned).not.toBe(date);
    });

    it('should clone Dates in nested structures', () => {
      const obj = {
        created: new Date('2024-01-01'),
        nested: {
          updated: new Date('2024-01-02'),
        },
      };
      
      const cloned = deepClone(obj);
      
      expect(cloned.created).toBeInstanceOf(Date);
      expect(cloned.nested.updated).toBeInstanceOf(Date);
      expect(cloned.created).not.toBe(obj.created);
      expect(cloned.nested.updated).not.toBe(obj.nested.updated);
      expect(cloned.created.getTime()).toBe(obj.created.getTime());
    });
  });
});

