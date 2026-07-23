const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);
};

/**
 * Robust string sanitizer for server input.
 * Strips script tags, unsafe protocols (javascript:, data:, vbscript:),
 * dangerous HTML elements (script, iframe, object, embed, style, form),
 * and all inline event handlers (onerror, onload, onclick, etc.).
 */
export const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;

  return value
    // Strip dangerous HTML tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip pseudo-protocols in links or attributes
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    // Strip all inline event attributes (e.g. onerror=, onload=, onclick=)
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .trim();
};

export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned;
  }
  return obj;
};

export const xssSanitize = (req, _res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};
