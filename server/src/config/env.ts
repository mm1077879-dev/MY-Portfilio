import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function isPlaceholderValue(value: string | undefined): boolean {
  return !value || /<(?:username|password|cluster-url|database-name|secret|token|example)>/i.test(value);
}

// Generate dev-only fallbacks to keep local development convenient. Production must treat these as required values.
const devFallbackJwtSecret = crypto.randomBytes(48).toString('hex');
const devFallbackCookieSecret = crypto.randomBytes(32).toString('hex');
const rawJwtSecret = (process.env.JWT_SECRET || '').trim();
const rawCookieSecret = (process.env.COOKIE_SECRET || '').trim();
const rawMongoDbUri = (process.env.MONGODB_URI || '').trim();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: isProduction,
  PORT: Number(process.env.PORT || 3000),
  CLIENT_URL: process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:3000',
  APP_URL: process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  MONGODB_URI: rawMongoDbUri,
  JWT_SECRET: rawJwtSecret || devFallbackJwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: rawCookieSecret || devFallbackCookieSecret,
  INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME || 'Mahim Dev',
  INITIAL_ADMIN_EMAIL: (
    process.env.INITIAL_ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    ''
  ).toLowerCase(),
  INITIAL_ADMIN_PASSWORD:
    process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '',
  CLOUDINARY_CLOUD_NAME: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  CLOUDINARY_API_KEY: (process.env.CLOUDINARY_API_KEY || '').trim(),
  CLOUDINARY_API_SECRET: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  EMAIL_SERVICE_HOST: (process.env.EMAIL_SERVICE_HOST || process.env.SMTP_HOST || '').trim(),
  EMAIL_SERVICE_PORT: Number(process.env.EMAIL_SERVICE_PORT || process.env.SMTP_PORT || 587),
  EMAIL_SERVICE_USER: (process.env.EMAIL_SERVICE_USER || process.env.SMTP_USER || '').trim(),
  EMAIL_SERVICE_PASSWORD: (
    process.env.EMAIL_SERVICE_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    ''
  ).trim(),
  EMAIL_FROM_ADDRESS: (
    process.env.EMAIL_FROM_ADDRESS ||
    process.env.EMAIL_FROM ||
    ''
  ).trim(),
};

export function validateProductionEnvironment(): void {
  if (!isProduction) {
    return;
  }

  const requiredValues = [
    ['MONGODB_URI', rawMongoDbUri],
    ['JWT_SECRET', rawJwtSecret],
    ['COOKIE_SECRET', rawCookieSecret],
  ] as const;

  for (const [name, value] of requiredValues) {
    if (!value || isPlaceholderValue(value)) {
      throw new Error(`Production configuration error: ${name} is required and must not be a placeholder value.`);
    }
  }

  if (rawJwtSecret.length < 32) {
    throw new Error('Production configuration error: JWT_SECRET must be at least 32 characters long.');
  }

  if (rawCookieSecret.length < 32) {
    throw new Error('Production configuration error: COOKIE_SECRET must be at least 32 characters long.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(rawMongoDbUri)) {
    throw new Error('Production configuration error: MONGODB_URI must be a MongoDB Atlas connection string.');
  }
}

export function validateInitialAdminConfig(): void {
  validateProductionEnvironment();

  if (!env.INITIAL_ADMIN_EMAIL || !env.INITIAL_ADMIN_PASSWORD) {
    throw new Error(
      'INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required to start the server.'
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.INITIAL_ADMIN_EMAIL)) {
    throw new Error('INITIAL_ADMIN_EMAIL must be a valid email address.');
  }
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfigIssues().length === 0;
}

export function getSmtpConfigIssues(): string[] {
  const issues: string[] = [];

  if (!env.EMAIL_SERVICE_HOST) {
    issues.push('EMAIL_SERVICE_HOST is missing');
  }
  if (
    !Number.isInteger(env.EMAIL_SERVICE_PORT) ||
    env.EMAIL_SERVICE_PORT < 1 ||
    env.EMAIL_SERVICE_PORT > 65535
  ) {
    issues.push('EMAIL_SERVICE_PORT must be a valid TCP port');
  }
  if (!env.EMAIL_SERVICE_USER) {
    issues.push('EMAIL_SERVICE_USER is missing');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EMAIL_SERVICE_USER)) {
    issues.push('EMAIL_SERVICE_USER must be a valid email address');
  }
  if (!env.EMAIL_SERVICE_PASSWORD) {
    issues.push('EMAIL_SERVICE_PASSWORD is missing');
  }
  if (!env.EMAIL_FROM_ADDRESS) {
    issues.push('EMAIL_FROM_ADDRESS is missing');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EMAIL_FROM_ADDRESS)) {
    issues.push('EMAIL_FROM_ADDRESS must be a valid email address');
  }

  return issues;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );
}
