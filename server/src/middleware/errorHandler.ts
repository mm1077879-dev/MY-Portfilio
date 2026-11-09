import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    (('status' in err && (err as { status?: number }).status === 404) ||
      ('statusCode' in err && (err as { statusCode?: number }).statusCode === 404) ||
      ('code' in err && (err as { code?: string }).code === 'ENOENT'))
  ) {
    res.status(404).json({
      success: false,
      error: {
        code: 'ASSET_NOT_FOUND',
        message: 'Requested static resource was not found.',
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: fieldErrors[0]?.message || 'Validation failed for submitted fields.',
        details: fieldErrors,
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds maximum allowed size of 8 MB.'
        : `File upload error: ${err.message}`;
    res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: msg,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key or validation errors
  if (typeof err === 'object' && err !== null && 'name' in err) {
    const namedErr = err as { name: string; code?: number; message?: string };
    if (namedErr.code === 11000) {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'A record with this unique identifier or slug already exists.',
        },
      });
      return;
    }
    if (namedErr.name === 'CastError') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid resource identifier format.',
        },
      });
      return;
    }
    if (namedErr.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: {
          code: 'DB_VALIDATION_ERROR',
          message: namedErr.message || 'Database validation failed.',
        },
      });
      return;
    }
  }

  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.IS_PROD
        ? 'An unexpected server error occurred.'
        : err instanceof Error
          ? err.message
          : 'Unexpected internal error',
    },
  });
}
