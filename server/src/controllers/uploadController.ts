import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaAsset } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { UPLOADS_DIR } from '../middleware/upload';
import { env, isCloudinaryConfigured } from '../config/env';
import { AppError } from '../utils/AppError';

async function uploadToCloudinaryIfConfigured(localFilePath: string): Promise<string | null> {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'mahim_portfolio';
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

    const fileBuffer = await fs.promises.readFile(localFilePath);
    const base64Data = `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`;

    const form = new URLSearchParams();
    form.append('file', base64Data);
    form.append('api_key', env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: form,
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as { secure_url?: string };
    return result.secure_url || null;
  } catch {
    return null;
  }
}

export async function listMediaAssets(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assets = await MediaAsset.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: assets });
  } catch (err) {
    next(err);
  }
}

function hasValidMagicSignature(buf: Buffer, mimeType: string): boolean {
  const mime = mimeType.toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mime === 'image/png') {
    return (
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  if (mime === 'image/webp') {
    return (
      buf.length >= 12 &&
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (mime === 'image/gif') {
    return (
      buf.length >= 6 &&
      (buf.subarray(0, 6).toString('ascii') === 'GIF89a' ||
        buf.subarray(0, 6).toString('ascii') === 'GIF87a')
    );
  }
  if (mime === 'application/pdf') {
    return buf.length >= 5 && buf.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  return false;
}

export async function uploadMediaFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('No file provided in upload request.', 400, 'NO_FILE_UPLOADED');
    }

    const localPath = req.file.path;
    const headerBuf = await fs.promises.readFile(localPath);
    if (!hasValidMagicSignature(headerBuf, req.file.mimetype)) {
      await fs.promises.unlink(localPath).catch(() => undefined);
      throw new AppError(
        'Uploaded file content does not match its declared file format.',
        400,
        'INVALID_FILE_SIGNATURE'
      );
    }

    let finalUrl = `/uploads/${req.file.filename}`;
    let provider: 'local' | 'cloudinary' = 'local';

    const cloudUrl = await uploadToCloudinaryIfConfigured(localPath);
    if (cloudUrl) {
      finalUrl = cloudUrl;
      provider = 'cloudinary';
      // Clean up temporary local file when uploaded to Cloudinary
      await fs.promises.unlink(localPath).catch(() => undefined);
    }

    const asset = await MediaAsset.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: finalUrl,
      provider,
      uploadedBy: req.admin?._id,
    });

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMediaFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) {
      throw new AppError('Media asset not found.', 404, 'ASSET_NOT_FOUND');
    }

    if (asset.provider === 'local') {
      const targetPath = path.join(UPLOADS_DIR, path.basename(asset.filename));
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath).catch(() => undefined);
      }
    }

    await asset.deleteOne();
    res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Media asset deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
