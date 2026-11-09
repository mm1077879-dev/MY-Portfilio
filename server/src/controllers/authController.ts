import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models';
import {
  AuthenticatedRequest,
  signAdminToken,
  setAuthCookie,
  clearAuthCookie,
  resolveOptionalAdmin,
} from '../middleware/auth';
import {
  loginSchema,
  changePasswordSchema,
  adminProfileUpdateSchema,
} from '../validations/schemas';
import { AppError } from '../utils/AppError';

export async function loginAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select(
      '+passwordHash'
    );

    if (!admin) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken(admin);
    setAuthCookie(req, res, token);
    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: {
        authenticated: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
          bio: admin.bio,
          twoFactorNote: admin.twoFactorNote,
          lastLoginAt: admin.lastLoginAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logoutAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    if (admin) {
      admin.authVersion = (admin.authVersion ?? 0) + 1;
      await admin.save();
    }
    clearAuthCookie(req, res);
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      data: { authenticated: false, message: 'Logged out successfully.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.set('Cache-Control', 'no-store');
    const admin = await resolveOptionalAdmin(req);
    if (!admin) {
      res.status(200).json({
        success: true,
        data: { authenticated: false, admin: null },
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        authenticated: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
          bio: admin.bio,
          twoFactorNote: admin.twoFactorNote,
          lastLoginAt: admin.lastLoginAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      throw new AppError('Not authenticated.', 401, 'UNAUTHORIZED');
    }
    res.status(200).json({
      success: true,
      data: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        avatar: req.admin.avatar,
        bio: req.admin.bio,
        twoFactorNote: req.admin.twoFactorNote,
        lastLoginAt: req.admin.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      throw new AppError('Not authenticated.', 401, 'UNAUTHORIZED');
    }
    const parsed = adminProfileUpdateSchema.parse(req.body);
    const updated = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        name: parsed.name,
        email: parsed.email.toLowerCase().trim(),
        ...(parsed.avatar !== undefined ? { avatar: parsed.avatar } : {}),
        ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
        ...(parsed.twoFactorNote !== undefined ? { twoFactorNote: parsed.twoFactorNote } : {}),
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      throw new AppError('Admin account not found.', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        bio: updated.bio,
        twoFactorNote: updated.twoFactorNote,
        lastLoginAt: updated.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function changeAdminPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      throw new AppError('Not authenticated.', 401, 'UNAUTHORIZED');
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const adminWithHash = await Admin.findById(req.admin._id).select('+passwordHash');
    if (!adminWithHash) {
      throw new AppError('Admin account not found.', 404, 'NOT_FOUND');
    }

    const valid = await adminWithHash.comparePassword(currentPassword);
    if (!valid) {
      throw new AppError('Current password is incorrect.', 400, 'INVALID_CURRENT_PASSWORD');
    }

    adminWithHash.passwordHash = await bcrypt.hash(newPassword, 12);
    adminWithHash.passwordChangedAt = new Date();
    await adminWithHash.save();

    const freshToken = signAdminToken(adminWithHash);
    setAuthCookie(req, res, freshToken);

    res.status(200).json({
      success: true,
      data: {
        authenticated: true,
        message: 'Password updated successfully.',
      },
    });
  } catch (err) {
    next(err);
  }
}
