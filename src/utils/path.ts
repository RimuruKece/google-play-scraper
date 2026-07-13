/**
 * Safe nested property access — replaces R.path from ramda.
 */
export function path<T = unknown>(pathArray: (string | number)[], obj: unknown): T | undefined {
  let current: unknown = obj;
  for (const key of pathArray) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current as T;
}
