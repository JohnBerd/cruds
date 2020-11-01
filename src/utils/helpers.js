export function isPlainObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    !(obj instanceof Date) &&
    !(obj instanceof RegExp) &&
    !(obj instanceof Map) &&
    !(obj instanceof Set)
  );
}
