import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Service } from '../models';
import { AuthenticatedRequest, resolveOptionalAdmin } from '../middleware/auth';
import { serviceSchema, serviceUpdateSchema } from '../validations/schemas';
import { slugify, stripUndefined } from '../utils/sanitize';
import { AppError } from '../utils/AppError';

export async function getServices(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeDrafts = Boolean(admin && req.query.includeDrafts === 'true');
    const filter: Record<string, unknown> = includeDrafts ? {} : { published: true };

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const services = await Service.find(filter).sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    next(err);
  }
}

export async function getServiceByIdOrSlug(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const idOrSlug = String(req.params.id || '').trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    const query: Record<string, unknown> = isObjectId
      ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
      : { slug: idOrSlug };

    if (!admin) {
      query.published = true;
    }

    const service = await Service.findOne(query);
    if (!service) {
      throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
}

export async function createService(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = serviceSchema.parse(req.body);
    let baseSlug = slugify(parsed.slug || parsed.title);
    if (!baseSlug) baseSlug = `service-${Date.now()}`;

    const existing = await Service.findOne({ slug: baseSlug });
    if (existing) {
      baseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await Service.countDocuments();
    const created = await Service.create({
      ...parsed,
      slug: baseSlug,
      order: parsed.order || count + 1,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateService(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = serviceUpdateSchema.parse(req.body);
    const updateData = stripUndefined(parsed as Record<string, unknown>);
    if (typeof parsed.slug === 'string' && parsed.slug.trim()) {
      updateData.slug = slugify(parsed.slug);
    } else if ('slug' in updateData && !parsed.slug) {
      delete updateData.slug;
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updated) {
      throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Service not found.', 404, 'SERVICE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Service deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
