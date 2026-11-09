import { Request, Response, NextFunction } from 'express';
import { About, Timeline, Skill, SiteSettings } from '../models';
import { AuthenticatedRequest, resolveOptionalAdmin } from '../middleware/auth';
import {
  aboutUpdateSchema,
  timelineItemSchema,
  timelineItemUpdateSchema,
} from '../validations/schemas';
import { stripUndefined } from '../utils/sanitize';
import { AppError } from '../utils/AppError';

export async function getAboutBundle(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeDrafts = Boolean(admin && req.query.includeDrafts === 'true');

    let about = await About.findOne();
    if (!about) {
      about = await About.create({});
    }

    const timeline = await Timeline.find(includeDrafts ? {} : { published: true }).sort({
      order: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: {
        about,
        timeline,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAbout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(aboutUpdateSchema.parse(req.body) as Record<string, unknown>);
    let about = await About.findOne();
    if (!about) {
      about = await About.create(parsed);
    } else {
      Object.assign(about, parsed);
      await about.save();
    }

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (err) {
    next(err);
  }
}

export async function createTimelineItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = timelineItemSchema.parse(req.body);
    const count = await Timeline.countDocuments();
    const item = await Timeline.create({
      ...parsed,
      order: parsed.order || count + 1,
    });
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTimelineItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(
      timelineItemUpdateSchema.parse(req.body) as Record<string, unknown>
    );
    const updated = await Timeline.findByIdAndUpdate(req.params.id, parsed, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) {
      throw new AppError('Timeline milestone not found.', 404, 'NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTimelineItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Timeline.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Timeline milestone not found.', 404, 'NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Milestone deleted.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadResumeSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [about, settings, skills, timeline] = await Promise.all([
      About.findOne(),
      SiteSettings.findOne(),
      Skill.find({ visible: true }).sort({ order: 1 }),
      Timeline.find({ published: true }).sort({ order: 1 }),
    ]);

    const devName = about?.developerName || settings?.developerName || 'Mahim Dev';
    const title = about?.subtitle || settings?.professionalTitle || 'Full-Stack Developer';
    const email = settings?.email || 'hello@mahimdev.com';
    const location = settings?.location || 'Remote Worldwide';

    const lines = [
      `${devName.toUpperCase()} — ${title}`,
      `Email: ${email} | Location: ${location}`,
      `====================================================================`,
      ``,
      `SUMMARY`,
      about?.biography || '',
      ``,
      `TECHNICAL SKILLS`,
      ...skills.map((s) => `- ${s.name} (${s.category}) — Proficiency: ${s.proficiency}%`),
      ``,
      `CAREER TIMELINE`,
      ...timeline.map((t) => `- [${t.year}] ${t.title}: ${t.description}`),
      ``,
      `Generated dynamically from ${devName} Portfolio CMS.`,
    ];

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${devName.toLowerCase().replace(/\s+/g, '-')}-cv.txt"`
    );
    res.status(200).send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
}
