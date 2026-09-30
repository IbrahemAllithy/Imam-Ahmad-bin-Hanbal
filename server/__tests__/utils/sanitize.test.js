import { escapeHtml, escapeRegex, sanitizeString, sanitizeObject } from '../../utils/sanitize.js';

describe('Sanitize Utils', () => {
  describe('escapeHtml', () => {
    it('يجب تحويل أحرف HTML الخاصة', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('يجب تحويل علامات الاقتباس', () => {
      expect(escapeHtml('Hello "World" & \'Test\'')).toBe(
        'Hello &quot;World&quot; &amp; &#x27;Test&#x27;'
      );
    });

    it('يجب إرجاع النص العادي كما هو', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('يجب التعامل مع القيم غير النصية', () => {
      expect(escapeHtml(null)).toBe(null);
      expect(escapeHtml(undefined)).toBe(undefined);
      expect(escapeHtml(123)).toBe(123);
    });
  });

  describe('escapeRegex', () => {
    it('يجب escape أحرف regex الخاصة', () => {
      expect(escapeRegex('test.com')).toBe('test\\.com');
      expect(escapeRegex('$100')).toBe('\\$100');
      expect(escapeRegex('(test)*')).toBe('\\(test\\)\\*');
    });

    it('يجب إرجاع النص العادي كما هو', () => {
      expect(escapeRegex('hello')).toBe('hello');
    });

    it('يجب التعامل مع القيم غير النصية', () => {
      expect(escapeRegex(null)).toBe('');
      expect(escapeRegex(undefined)).toBe('');
    });

    it('يجب escape جميع أحرف regex', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const escaped = escapeRegex(specialChars);
      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });

  describe('sanitizeString', () => {
    it('يجب إزالة script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      expect(sanitizeString(malicious)).toBe('Hello');
    });

    it('يجب إزالة inline event handlers', () => {
      const malicious = '<img src=x onerror="alert(1)">';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).not.toContain('onerror');
    });

    it('يجب إزالة javascript: protocol', () => {
      const malicious = '<a href="javascript:alert(1)">Click</a>';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).not.toContain('javascript:');
    });

    it('يجب إزالة vbscript: protocol', () => {
      const malicious = '<a href="vbscript:msgbox">Click</a>';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).not.toContain('vbscript:');
    });

    it('يجب إزالة iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe>Safe';
      expect(sanitizeString(malicious)).toBe('Safe');
    });

    it('يجب إزالة object و embed tags', () => {
      expect(sanitizeString('<object data="evil"></object>Text')).toBe('Text');
      expect(sanitizeString('<embed src="evil"></embed>Text')).toBe('Text');
    });

    it('يجب إزالة style tags', () => {
      expect(sanitizeString('<style>body{display:none}</style>Text')).toBe('Text');
    });

    it('يجب الحفاظ على النص العادي', () => {
      const safe = 'مرحباً بك في الموقع';
      expect(sanitizeString(safe)).toBe(safe);
    });

    it('يجب التعامل مع القيم غير النصية', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBe(null);
    });

    it('يجب إزالة multiple threats', () => {
      const malicious = '<script>alert(1)</script><img src=x onerror="alert(2)"><iframe src="evil"></iframe>Safe';
      const sanitized = sanitizeString(malicious);
      expect(sanitized).toBe('Safe');
      expect(sanitized).not.toContain('script');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('iframe');
    });
  });

  describe('sanitizeObject', () => {
    it('يجب sanitize strings في object', () => {
      const input = {
        title: '<script>alert(1)</script>Title',
        description: 'Safe text',
      };
      const result = sanitizeObject(input);
      expect(result.title).toBe('Title');
      expect(result.description).toBe('Safe text');
    });

    it('يجب sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>alert(1)</script>Ahmad',
          bio: 'Safe bio',
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('Ahmad');
      expect(result.user.bio).toBe('Safe bio');
    });

    it('يجب sanitize arrays', () => {
      const input = {
        tags: ['<script>bad</script>tag1', 'safe-tag'],
      };
      const result = sanitizeObject(input);
      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('safe-tag');
    });

    it('يجب الحفاظ على الأرقام والقيم الأخرى', () => {
      const input = {
        count: 42,
        active: true,
        nothing: null,
      };
      const result = sanitizeObject(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.nothing).toBe(null);
    });

    it('يجب التعامل مع structures معقدة', () => {
      const input = {
        user: {
          name: '<script>alert(1)</script>Test',
          posts: [
            { title: '<iframe>Bad</iframe>Post1' },
            { title: 'Safe Post' },
          ],
        },
        count: 10,
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('Test');
      expect(result.user.posts[0].title).toBe('Post1');
      expect(result.user.posts[1].title).toBe('Safe Post');
      expect(result.count).toBe(10);
    });

    it('يجب التعامل مع null و undefined', () => {
      expect(sanitizeObject(null)).toBe(null);
      expect(sanitizeObject(undefined)).toBe(undefined);
    });

    it('يجب sanitize arrays مباشرة', () => {
      const input = ['<script>bad</script>item1', 'safe item'];
      const result = sanitizeObject(input);
      expect(result[0]).toBe('item1');
      expect(result[1]).toBe('safe item');
    });
  });
});
