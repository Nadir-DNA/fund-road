
/**
 * Safely merges multiple objects, ensuring all inputs are valid objects
 */
export function safeObjectMerge(...sources: unknown[]): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const source of sources) {
    if (source !== null && typeof source === 'object' && !Array.isArray(source)) {
      Object.keys(source as Record<string, any>).forEach(key => {
        result[key] = (source as Record<string, any>)[key];
      });
    }
  }
  
  return result;
}

/**
 * Checks if a value is a valid object that can be spread
 */
export function isValidObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
