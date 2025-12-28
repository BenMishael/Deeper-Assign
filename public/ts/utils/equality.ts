/**
 * Deep equality comparison utility
 * Fast and memory-efficient alternative to JSON.stringify comparison
 */

/**
 * Deep equality check for objects and arrays
 * Handles nested structures efficiently
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Same reference or both primitive equal
  if (a === b) return true;
  
  // Handle null/undefined
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  // Primitives that aren't equal
  if (typeof a !== 'object') return false;
  
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  // One is array, other is not
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  // Objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  
  const keysA = Object.keys(aObj);
  const keysB = Object.keys(bObj);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    return deepEqual(aObj[key], bObj[key]);
  });
}

/**
 * Create a deep clone of an object
 * More efficient than structuredClone for simple objects
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  const cloned: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }
  
  return cloned as T;
}

