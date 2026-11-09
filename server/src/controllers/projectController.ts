import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models';
import { AuthenticatedRequest, resolveOptionalAdmin } from '../middleware/auth';
import { projectSchema, projectUpdateSchema } from '../validations/schemas';
import { slugify, parsePositiveInt, stripUndefined } from '../utils/sanitize';
import { AppError } from '../utils/AppError';

export async function getProjects(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeDrafts = Boolean(admin && req.query.includeDrafts === 'true');

    const filter: Record<string, unknown> = {};
    if (!includeDrafts) {
      filter.published = true;
    }

    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    if (category && category !== 'All' && category !== 'All Projects') {
      if (category === 'Business Sites') {
        filter.category = 'Business';
      } else {
        filter.category = category;
      }
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { shortDescription: regex },
        { technologies: regex },
        { category: regex },
      ];
    }

    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 24, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Project.find(filter)
        .sort({ order: 1, featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProjectByIdOrSlug(
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

    const project = await Project.findOne(query);
    if (!project) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }

    // Increment public view count when visited by a visitor
    if (!admin) {
      project.views = (project.views || 0) + 1;
      await project.save();
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = projectSchema.parse(req.body);
    let baseSlug = slugify(parsed.slug || parsed.title);
    if (!baseSlug) baseSlug = `project-${Date.now()}`;

    const existing = await Project.findOne({ slug: baseSlug });
    if (existing) {
      baseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await Project.countDocuments();
    const created = await Project.create({
      ...parsed,
      slug: baseSlug,
      order: parsed.order || count + 1,
      caseStudyUrl: parsed.caseStudyUrl || `/projects/${baseSlug}`,
      createdBy: req.admin?._id,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = projectUpdateSchema.parse(req.body);
    const updateData = stripUndefined(parsed as Record<string, unknown>);

    if (typeof parsed.slug === 'string' && parsed.slug.trim()) {
      updateData.slug = slugify(parsed.slug);
    } else if ('slug' in updateData && !parsed.slug) {
      delete updateData.slug;
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updated) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderProjects(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!Array.isArray(req.body?.orderedIds)) {
      throw new AppError('orderedIds array is required.', 400, 'INVALID_PAYLOAD');
    }
    const orderedIds: unknown[] = req.body.orderedIds;
    for (const id of orderedIds) {
      if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid project identifier in orderedIds.', 400, 'INVALID_ID');
      }
    }

    await Promise.all(
      (orderedIds as string[]).map((id, idx) =>
        Project.findByIdAndUpdate(id, { order: idx + 1 })
      )
    );
    res.status(200).json({
      success: true,
      data: { message: 'Project display order updated.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Project deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
