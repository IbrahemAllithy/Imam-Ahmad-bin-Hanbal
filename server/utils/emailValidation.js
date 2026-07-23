import dns from 'dns/promises';

/** Common disposable / temporary email domains */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.de',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'fakeinbox.com',
  'getnada.com',
  'maildrop.cc',
  'dispostable.com',
  'mailnesia.com',
  'tempail.com',
  'emailondeck.com',
  'moakt.com',
  'tmpmail.org',
  'tmpmail.net',
  'discard.email',
  'mailcatch.com',
  'mytemp.email',
  'tempinbox.com',
]);

/** Local-part patterns that usually indicate fake / test accounts */
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
  'null',
  'undefined',
  'admin',
  'root',
  'noreply',
  'no-reply',
  'temp',
  'temporary',
  'xxx',
  'xyz',
  'aaa',
  'bbb',
  'ccc',
  '123',
  '1234',
  '12345',
  'email',
  'mail',
]);

const STRICT_EMAIL_REGEX =
  /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const isStrictEmailFormat = (email) => STRICT_EMAIL_REGEX.test(normalizeEmail(email));

export const validateEmailIdentity = async (rawEmail) => {
  const email = normalizeEmail(rawEmail);

  if (!email) {
    return { ok: false, message: 'البريد الإلكتروني مطلوب' };
  }

  if (!isStrictEmailFormat(email) || email.includes('..')) {
    return { ok: false, message: 'صيغة البريد الإلكتروني غير صحيحة' };
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain || domain.split('.').length < 2) {
    return { ok: false, message: 'صيغة البريد الإلكتروني غير صحيحة' };
  }

  if (localPart.length < 2) {
    return { ok: false, message: 'البريد الإلكتروني قصير جداً' };
  }

  const localBase = localPart.replace(/[0-9._+-]/g, '');
  if (FAKE_LOCAL_PARTS.has(localPart) || FAKE_LOCAL_PARTS.has(localBase)) {
    return {
      ok: false,
      message: 'لا يُسمح باستخدام بريد تجريبي أو وهمي — استخدم بريدك الحقيقي',
    };
  }

  if (/^(test|fake|demo|temp|asdf|qwer|xxx|user\d*)([._+-]|$)/i.test(localPart)) {
    return {
      ok: false,
      message: 'لا يُسمح باستخدام بريد تجريبي أو وهمي — استخدم بريدك الحقيقي',
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      message: 'البريد المؤقت غير مسموح — استخدم بريداً دائماً مثل Gmail أو Outlook',
    };
  }

  try {
    const mx = await dns.resolveMx(domain);
    if (!mx?.length) {
      return {
        ok: false,
        message: 'نطاق البريد غير صالح أو لا يستقبل الرسائل',
      };
    }
  } catch {
    return {
      ok: false,
      message: 'نطاق البريد غير صالح أو لا يستقبل الرسائل',
    };
  }

  return { ok: true, email };
};

export const validatePersonName = (rawName = '') => {
  const name = rawName.trim().replace(/\s+/g, ' ');

  if (!name) {
    return { ok: false, message: 'الاسم مطلوب' };
  }

  if (name.length < 3) {
    return { ok: false, message: 'الاسم يجب أن يكون 3 أحرف على الأقل' };
  }

  if (name.length > 100) {
    return { ok: false, message: 'الاسم طويل جداً' };
  }

  // Must contain real letters (Arabic or Latin), not only numbers/symbols
  if (!/[\u0600-\u06FFa-zA-Z]{2,}/.test(name)) {
    return { ok: false, message: 'أدخل اسماً حقيقياً بالحروف' };
  }

  // Reject very repetitive gibberish like اااا / asdfasdf
  const compact = name.replace(/\s/g, '');
  if (/^(.)\1{3,}$/.test(compact)) {
    return { ok: false, message: 'أدخل اسماً حقيقياً صحيحاً' };
  }

  if (/^(.)(.)(\1\2){2,}$/.test(compact) && compact.length <= 12) {
    return { ok: false, message: 'أدخل اسماً حقيقياً صحيحاً' };
  }

  return { ok: true, name };
};
