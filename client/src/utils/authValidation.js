const FAKE_LOCAL_PARTS = new Set([
  'test',
  'testing',
  'tester',
  'fake',
  'dummy',
  'sample',
  'example',
  'demo',
  'asdf',
  'asdfgh',
  'qwerty',
  'abc',
  'abcd',
  'abc123',
  'user',
  'username',
  'temp',
  'temporary',
  'xxx',
  'xyz',
  'email',
  'mail',
  '123',
  '1234',
  '12345',
]);

const STRICT_EMAIL_REGEX =
  /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

export const validateClientEmail = (rawEmail = '') => {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!STRICT_EMAIL_REGEX.test(email) || email.includes('..')) {
    return 'صيغة البريد الإلكتروني غير صحيحة';
  }

  const [localPart] = email.split('@');
  const localBase = localPart.replace(/[0-9._+-]/g, '');
  if (FAKE_LOCAL_PARTS.has(localPart) || FAKE_LOCAL_PARTS.has(localBase)) {
    return 'لا يُسمح باستخدام بريد تجريبي أو وهمي — استخدم بريدك الحقيقي';
  }
  if (/^(test|fake|demo|temp|asdf|qwer|xxx|user\d*)([._+-]|$)/i.test(localPart)) {
    return 'لا يُسمح باستخدام بريد تجريبي أو وهمي — استخدم بريدك الحقيقي';
  }
  return '';
};

export const validateClientName = (rawName = '') => {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (!name) return 'الاسم مطلوب';
  if (name.length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
  if (!/[\u0600-\u06FFa-zA-Z]{2,}/.test(name)) return 'أدخل اسماً حقيقياً بالحروف';
  const compact = name.replace(/\s/g, '');
  if (/^(.)\1{3,}$/.test(compact)) return 'أدخل اسماً حقيقياً صحيحاً';
  return '';
};
