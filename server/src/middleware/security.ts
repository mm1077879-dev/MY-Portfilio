import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { sanitizePayload } from '../utils/sanitize';

export function sanitizeRequestMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizePayload(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    const cleanedQuery = sanitizePayload(req.query) as Record<string, unknown>;
    for (const key of Object.keys(req.query)) {
      delete (req.query as Record<string, unknown>)[key];
    }
    Object.assign(req.query, cleanedQuery);
  }
  next();
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    },
  },
});

export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'CONTACT_RATE_LIMIT',
      message: 'Too many messages submitted recently. Please wait a few minutes before sending another inquiry.',
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'API request rate limit exceeded. Please slow down.',
    },
  },
});
