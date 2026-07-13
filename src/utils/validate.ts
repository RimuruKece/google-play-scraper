/**
 * Minimal runtime check that an extracted object has required keys.
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
): data is T {
  return fields.every((f) => data[f] != null);
}
