/**
 * Deep equality comparison utility
 * Fast and memory-efficient alternative to JSON.stringify comparison
 */

/**
 * Deep equality check for objects and arrays with circular reference detection
 * Handles nested structures efficiently
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  return deepEqualInternal(a, b, new WeakMap());
}

/**
 * Internal implementation with cycle detection
 */
function deepEqualInternal(a: unknown, b: unknown, cache: WeakMap<object, Set<object>>): boolean {
  // Same reference or both primitive equal (covers same object, NaN === NaN check below)
  if (a === b) return true;
  
  // Handle NaN (NaN !== NaN, but we want deepEqual(NaN, NaN) === true)
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }
  
  // Handle null/undefined
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  // Primitives that aren't equal
  if (typeof a !== 'object') return false;
  
  // Handle Date objects
  if (a instanceof Date || b instanceof Date) {
    // Both must be Date instances to be equal
    if (!(a instanceof Date) || !(b instanceof Date)) return false;
    return a.getTime() === b.getTime();
  }
  
  // Circular reference detection
  if (!cache.has(a as object)) {
    cache.set(a as object, new Set());
  }
  const seen = cache.get(a as object)!;
  if (seen.has(b as object)) {
    // Already comparing these objects - assume equal to break cycle
    return true;
  }
  seen.add(b as object);
  
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualInternal(a[i], b[i], cache)) return false;
    }
    return true;
  }
  
  // One is array, other is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  // Objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  
  const keysA = Object.keys(aObj);
  const keysB = Object.keys(bObj);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    if (!deepEqualInternal(aObj[key], bObj[key], cache)) return false;
  }
  
  return true;
}

/**
 * Create a deep clone of an object with circular reference detection
 * More efficient than structuredClone for simple objects
 */
export function deepClone<T>(obj: T): T {
  return deepCloneInternal(obj, new WeakMap());
}

/**
 * Internal implementation with cycle detection
 */
function deepCloneInternal<T>(obj: T, cache: WeakMap<object, unknown>): T {
  // Primitives and null
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Check cache for circular references
  if (cache.has(obj as object)) {
    return cache.get(obj as object) as T;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  // Handle Arrays
  if (Array.isArray(obj)) {
    const cloned: unknown[] = [];
    cache.set(obj as object, cloned);
    for (let i = 0; i < obj.length; i++) {
      cloned[i] = deepCloneInternal(obj[i], cache);
    }
    return cloned as unknown as T;
  }
  
  // Handle Objects
  const cloned: Record<string, unknown> = {};
  cache.set(obj as object, cloned);
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneInternal((obj as Record<string, unknown>)[key], cache);
    }
  }
  
  return cloned as T;
}

