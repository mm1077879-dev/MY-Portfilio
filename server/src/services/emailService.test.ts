import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../config/env';
import {
  buildContactMessageEmail,
  sendContactMessageNotification,
} from './emailService';

test('contact notification escapes visitor content and includes plain text', () => {
  const email = buildContactMessageEmail({
    fullName: '<img src=x onerror=alert(1)>',
    email: 'visitor@example.com',
    service: 'Web Development',
    subject: '<script>alert(1)</script>',
    message: 'Please review <b>this request</b>.',
    createdAt: new Date('2026-11-09T12:00:00.000Z'),
  });

  assert.equal(email.subject, 'New Contact Form Message - Mahim Dev');
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(email.html, /Please review &lt;b&gt;this request&lt;\/b&gt;\./);
  assert.doesNotMatch(email.html, /<img|<script|<b>/);
  assert.match(email.text, /Name: <img src=x onerror=alert\(1\)>/);
  assert.match(email.text, /Submitted at \(UTC\): 2026-11-09T12:00:00\.000Z/);
});

test('missing SMTP configuration is reported without throwing', async () => {
  const originalConfig = {
    host: env.EMAIL_SERVICE_HOST,
    user: env.EMAIL_SERVICE_USER,
    password: env.EMAIL_SERVICE_PASSWORD,
    from: env.EMAIL_FROM_ADDRESS,
  };
  const originalError = console.error;
  const logs: string[] = [];

  env.EMAIL_SERVICE_HOST = '';
  env.EMAIL_SERVICE_USER = '';
  env.EMAIL_SERVICE_PASSWORD = '';
  env.EMAIL_FROM_ADDRESS = '';
  console.error = (...args: unknown[]) => {
    logs.push(
      args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ')
    );
  };

  try {
    await sendContactMessageNotification({
      messageId: 'message-test-id',
      fullName: 'Test Visitor',
      email: 'visitor@example.com',
      service: 'Web Development',
      subject: 'Test inquiry',
      message: 'A sufficiently long test message.',
      createdAt: new Date('2026-11-09T12:00:00.000Z'),
    });
  } finally {
    env.EMAIL_SERVICE_HOST = originalConfig.host;
    env.EMAIL_SERVICE_USER = originalConfig.user;
    env.EMAIL_SERVICE_PASSWORD = originalConfig.password;
    env.EMAIL_FROM_ADDRESS = originalConfig.from;
    console.error = originalError;
  }

  assert.match(logs.join('\n'), /Contact notification skipped/);
  assert.match(logs.join('\n'), /EMAIL_SERVICE_PASSWORD is missing/);
  assert.doesNotMatch(logs.join('\n'), /YOUR_GMAIL_APP_PASSWORD/);
});
