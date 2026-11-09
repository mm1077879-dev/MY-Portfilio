import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin, IAdmin } from '../models';
import { AppError } from '../utils/AppError';

export interface JwtAdminPayload {
  sub: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor';
  pwdAt?: number;
  authVersion?: number;
  iat?: number;
}

export interface AuthenticatedRequest extends Request {
  admin?: IAdmin;
}

export const AUTH_COOKIE_NAME = 'mahim_admin_token';

export function signAdminToken(admin: IAdmin): string {
  const payload: JwtAdminPayload = {
    sub: String(admin._id),
    email: admin.email,
    role: admin.role,
    pwdAt: admin.passwordChangedAt ? admin.passwordChangedAt.getTime() : 0,
    authVersion: admin.authVersion,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function isTokenInvalidatedByPasswordChange(admin: IAdmin, decoded: JwtAdminPayload): boolean {
  if (!admin.passwordChangedAt) {
    return false;
  }
  const changedAtMs = admin.passwordChangedAt.getTime();
  if (typeof decoded.pwdAt === 'number') {
    return decoded.pwdAt < changedAtMs;
  }
  if (typeof decoded.iat === 'number') {
    return decoded.iat * 1000 < changedAtMs;
  }
  return true;
}

export function setAuthCookie(req: Request, res: Response, token: string): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(req: Request, res: Response): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
  });
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  if (req.cookies && typeof req.cookies[AUTH_COOKIE_NAME] === 'string') {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  return null;
}

export async function resolveOptionalAdmin(req: AuthenticatedRequest): Promise<IAdmin | null> {
  const token = extractToken(req);
  if (!token) return null;

  let decoded: JwtAdminPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtAdminPayload;
  } catch {
    return null;
  }

  const admin = await Admin.findById(decoded.sub);
  if (
    admin &&
    !isTokenInvalidatedByPasswordChange(admin, decoded) &&
    (decoded.authVersion ?? 0) === (admin.authVersion ?? 0)
  ) {
    req.admin = admin;
    return admin;
  }
  return null;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError('Authentication required. Please log in to continue.', 401, 'UNAUTHORIZED');
    }

    let decoded: JwtAdminPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtAdminPayload;
    } catch {
      throw new AppError('Invalid or expired authentication session.', 401, 'TOKEN_EXPIRED');
    }

    const admin = await Admin.findById(decoded.sub);
    if (!admin) {
      throw new AppError('Administrator account no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (isTokenInvalidatedByPasswordChange(admin, decoded)) {
      throw new AppError(
        'Session invalidated because password was recently changed. Please sign in again.',
        401,
        'PASSWORD_CHANGED'
      );
    }

    if ((decoded.authVersion ?? 0) !== (admin.authVersion ?? 0)) {
      throw new AppError('Session has been revoked. Please sign in again.', 401, 'SESSION_REVOKED');
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...allowedRoles: Array<'superadmin' | 'admin' | 'editor'>) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
      return;
    }
    if (!allowedRoles.includes(req.admin.role)) {
      next(
        new AppError(
          'Insufficient role permissions for this operation.',
          403,
          'FORBIDDEN'
        )
      );
      return;
    }
    next();
  };
}
