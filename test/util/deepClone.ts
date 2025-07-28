/**
 * Recursively creates a deep clone of the given value, handling circular references.
 *
 * This function supports:
 * - Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`)
 * - Arrays (including nested arrays)
 * - Plain objects (including nested objects)
 * - Circular references (using WeakMap)
 *
 * Note: This does **not** handle special types like `Date`, `Map`, `Set`,
 * `RegExp`, or `Function`.
 *
 * @param param - The value to deep clone.
 * @param seen - Internal WeakMap to track circular references.
 * @returns A deep clone of the input value.
 */
function deepClone<T>(param: T, seen = new WeakMap()): T {
  if (param === null || typeof param !== 'object') {
    return param;
  }

  // Only objects (not arrays) can be WeakMap keys
  if (seen.has(param as object)) {
    return seen.get(param as object);
  }

  if (Array.isArray(param)) {
    const arr: unknown[] = [];
    seen.set(param as unknown as object, arr);
    for (const item of param as unknown as unknown[]) {
      arr.push(deepClone(item, seen));
    }
    return arr as unknown as T;
  }

  const newObj: Record<string, unknown> = {};
  seen.set(param as object, newObj);
  for (const key in param) {
    if (Object.prototype.hasOwnProperty.call(param, key)) {
      newObj[key] = deepClone((param as Record<string, unknown>)[key], seen);
    }
  }
  return newObj as T;
}

export default deepClone;
