/**
 * Sanitize text inputs to prevent Cross-Site Scripting (XSS) attacks.
 * Replaces HTML special characters with safe encoded entities.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize complex objects recursively.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized as T;
  }
  
  return obj;
}
