import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contactMessageCreateSchema,
  projectSchema,
  projectUpdateSchema,
  serviceUpdateSchema,
  siteSettingsUpdateSchema,
  changePasswordSchema,
  analyticsTrackSchema,
} from './schemas';
import {
  sanitizePayload,
  slugify,
  createPrivacyVisitorHash,
  parsePositiveInt,
  stripUndefined,
  isSafeUrlOrPath,
  isSafeHttpsEmbedUrl,
} from '../utils/sanitize';

test('sanitizePayload strips MongoDB operator keys and trims strings', () => {
  const malicious = {
    email: '  admin@mahimdev.com  ',
    $gt: '',
    nested: {
      'bad.key': 'inject',
      safe: 'ok\0',
    },
  };
  const cleaned = sanitizePayload(malicious) as Record<string, unknown>;
  assert.equal(cleaned.email, 'admin@mahimdev.com');
  assert.equal('$gt' in cleaned, false);
  assert.deepEqual(cleaned.nested, { safe: 'ok' });
});

test('slugify generates deterministic URL-safe slugs', () => {
  assert.equal(slugify('NextGen Mart — E-Commerce Platform!'), 'nextgen-mart-e-commerce-platform');
  assert.equal(slugify('  TaskFlow Pro 2.0  '), 'taskflow-pro-2-0');
});

test('parsePositiveInt clamps bounds and handles NaN or negative values safely', () => {
  assert.equal(parsePositiveInt('abc', 14, 90), 14);
  assert.equal(parsePositiveInt('-5', 1, 50), 1);
  assert.equal(parsePositiveInt('0', 1, 50), 1);
  assert.equal(parsePositiveInt('250', 24, 50), 50);
  assert.equal(parsePositiveInt('3', 1, 50), 3);
});

test('analyticsTrackSchema accepts the homepage while rejecting malformed or private routes', () => {
  assert.equal(analyticsTrackSchema.safeParse({ path: '/' }).success, true);
  assert.equal(analyticsTrackSchema.safeParse({ path: '/projects' }).success, true);
  assert.equal(analyticsTrackSchema.safeParse({}).success, false);
  assert.equal(analyticsTrackSchema.safeParse({ path: 42 }).success, false);
  assert.equal(analyticsTrackSchema.safeParse({ path: null }).success, false);
  assert.equal(analyticsTrackSchema.safeParse({ path: 'projects' }).success, false);
  assert.equal(analyticsTrackSchema.safeParse({ path: '/admin' }).success, false);
});

test('isSafeUrlOrPath and isSafeHttpsEmbedUrl block javascript:/data:/protocol-relative URLs', () => {
  assert.equal(isSafeUrlOrPath(''), true);
  assert.equal(isSafeUrlOrPath('/projects/nextgen-mart'), true);
  assert.equal(isSafeUrlOrPath('#contact'), true);
  assert.equal(isSafeUrlOrPath('https://github.com/mahimdev'), true);
  assert.equal(isSafeUrlOrPath('mailto:hello@mahimdev.com'), true);
  assert.equal(isSafeUrlOrPath('//evil.example/payload.js'), false);
  assert.equal(isSafeUrlOrPath('javascript:alert(1)'), false);
  assert.equal(isSafeUrlOrPath('data:text/html,<script>alert(1)</script>'), false);

  assert.equal(isSafeHttpsEmbedUrl('https://www.openstreetmap.org/export/embed.html'), true);
  assert.equal(isSafeHttpsEmbedUrl('http://insecure.example/map'), false);
  assert.equal(isSafeHttpsEmbedUrl('javascript:alert(1)'), false);
});

test('contactMessageCreateSchema enforces required fields and blocks honeypot spam', () => {
  const invalid = contactMessageCreateSchema.safeParse({
    fullName: 'A',
    email: 'not-an-email',
    subject: 'Hi',
    message: 'short',
  });
  assert.equal(invalid.success, false);

  const bot = contactMessageCreateSchema.safeParse({
    fullName: 'Spam Bot',
    email: 'bot@example.com',
    subject: 'Buy links',
    message: 'This is a long enough spam message body.',
    honeypot: 'filled-by-bot',
  });
  assert.equal(bot.success, false);

  const valid = contactMessageCreateSchema.safeParse({
    fullName: 'Sarah Khan',
    email: 'sarah@techvista.io',
    service: 'SaaS Applications',
    subject: 'New Analytics Portal',
    message: 'We would love to discuss building our new B2B analytics portal.',
  });
  assert.equal(valid.success, true);
});

test('projectSchema validates categories, defaults, and rejects unsafe URLs', () => {
  const parsed = projectSchema.safeParse({
    title: 'NextGen Mart',
    category: 'E-Commerce',
    shortDescription: 'A modern eCommerce platform with advanced features.',
    thumbnail: '/uploads/nextgen.jpg',
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.published, true);
    assert.equal(parsed.data.featured, false);
  }

  const unsafeUrl = projectSchema.safeParse({
    title: 'Bad Project',
    category: 'SaaS',
    shortDescription: 'A modern eCommerce platform with advanced features.',
    thumbnail: '/uploads/nextgen.jpg',
    liveUrl: 'javascript:alert(document.cookie)',
  });
  assert.equal(unsafeUrl.success, false);
});

test('projectUpdateSchema and serviceUpdateSchema preserve omitted fields on partial updates', () => {
  const partialProject = stripUndefined(
    projectUpdateSchema.parse({ featured: true }) as Record<string, unknown>
  );
  assert.deepEqual(partialProject, { featured: true });
  assert.equal('technologies' in partialProject, false);
  assert.equal('overview' in partialProject, false);
  assert.equal('published' in partialProject, false);

  const partialService = stripUndefined(
    serviceUpdateSchema.parse({ featured: false }) as Record<string, unknown>
  );
  assert.deepEqual(partialService, { featured: false });
  assert.equal('features' in partialService, false);
});

test('siteSettingsUpdateSchema rejects unsafe mapEmbedUrl and social link schemes', () => {
  assert.equal(
    siteSettingsUpdateSchema.safeParse({
      mapEmbedUrl: 'javascript:alert(1)',
    }).success,
    false
  );
  assert.equal(
    siteSettingsUpdateSchema.safeParse({
      socialLinks: [{ platform: 'GitHub', label: 'GitHub', url: 'javascript:alert(1)' }],
    }).success,
    false
  );
});

test('changePasswordSchema requires uppercase and numeric characters', () => {
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: 'oldpassword',
      newPassword: 'weakpassword',
    }).success,
    false
  );
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: 'oldpassword',
      newPassword: 'StrongPassword9',
    }).success,
    true
  );
});

test('createPrivacyVisitorHash returns consistent 24-char anonymized hash', () => {
  const h1 = createPrivacyVisitorHash('203.0.113.5', 'Mozilla/5.0', '2026-11-01');
  const h2 = createPrivacyVisitorHash('203.0.113.5', 'Mozilla/5.0', '2026-11-01');
  const h3 = createPrivacyVisitorHash('203.0.113.5', 'Mozilla/5.0', '2026-11-02');
  assert.equal(h1.length, 24);
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
});
