import { Response, NextFunction } from 'express';
import { Testimonial, Skill, FAQ, Pricing, SiteSettings } from '../models';
import { AuthenticatedRequest, resolveOptionalAdmin } from '../middleware/auth';
import {
  testimonialSchema,
  testimonialUpdateSchema,
  skillSchema,
  skillUpdateSchema,
  faqSchema,
  faqUpdateSchema,
  pricingSchema,
  pricingUpdateSchema,
  siteSettingsUpdateSchema,
} from '../validations/schemas';
import { stripUndefined } from '../utils/sanitize';
import { AppError } from '../utils/AppError';

// --- TESTIMONIALS ---
export async function getTestimonials(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeDrafts = Boolean(admin && req.query.includeDrafts === 'true');
    const items = await Testimonial.find(includeDrafts ? {} : { published: true }).sort({
      featured: -1,
      order: 1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createTestimonial(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = testimonialSchema.parse(req.body);
    const count = await Testimonial.countDocuments();
    const created = await Testimonial.create({
      ...parsed,
      order: parsed.order || count + 1,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateTestimonial(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(
      testimonialUpdateSchema.parse(req.body) as Record<string, unknown>
    );
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, parsed, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) throw new AppError('Testimonial not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTestimonial(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError('Testimonial not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// --- SKILLS ---
export async function getSkills(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeHidden = Boolean(admin && req.query.includeDrafts === 'true');
    const items = await Skill.find(includeHidden ? {} : { visible: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createSkill(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = skillSchema.parse(req.body);
    const count = await Skill.countDocuments();
    const created = await Skill.create({
      ...parsed,
      order: parsed.order || count + 1,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateSkill(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(
      skillUpdateSchema.parse(req.body) as Record<string, unknown>
    );
    const updated = await Skill.findByIdAndUpdate(req.params.id, parsed, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) throw new AppError('Skill not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteSkill(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Skill.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError('Skill not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// --- FAQ ---
export async function getFAQs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeHidden = Boolean(admin && req.query.includeDrafts === 'true');
    const items = await FAQ.find(includeHidden ? {} : { visible: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createFAQ(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = faqSchema.parse(req.body);
    const count = await FAQ.countDocuments();
    const created = await FAQ.create({
      ...parsed,
      order: parsed.order || count + 1,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateFAQ(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(
      faqUpdateSchema.parse(req.body) as Record<string, unknown>
    );
    const updated = await FAQ.findByIdAndUpdate(req.params.id, parsed, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) throw new AppError('FAQ item not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteFAQ(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await FAQ.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError('FAQ item not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// --- PRICING ---
export async function getPricingPackages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    const includeHidden = Boolean(admin && req.query.includeDrafts === 'true');
    const items = await Pricing.find(includeHidden ? {} : { visible: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createPricingPackage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = pricingSchema.parse(req.body);
    const count = await Pricing.countDocuments();
    const created = await Pricing.create({
      ...parsed,
      order: parsed.order || count + 1,
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function updatePricingPackage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = stripUndefined(
      pricingUpdateSchema.parse(req.body) as Record<string, unknown>
    );
    const updated = await Pricing.findByIdAndUpdate(req.params.id, parsed, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) throw new AppError('Pricing package not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deletePricingPackage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Pricing.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError('Pricing package not found.', 404, 'NOT_FOUND');
    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// --- SITE SETTINGS ---
export async function getSiteSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const admin = await resolveOptionalAdmin(req);
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    const plain = settings.toObject();
    if (!admin && Array.isArray(plain.socialLinks)) {
      plain.socialLinks = plain.socialLinks
        .filter((s) => s.visible)
        .sort((a, b) => a.order - b.order);
    }

    res.status(200).json({ success: true, data: plain });
  } catch (err) {
    next(err);
  }
}

export async function updateSiteSettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = siteSettingsUpdateSchema.parse(req.body);
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    // Merge top-level scalar fields
    const scalarKeys = [
      'siteTitle',
      'logoText',
      'logoUrl',
      'faviconUrl',
      'developerName',
      'professionalTitle',
      'email',
      'phone',
      'whatsapp',
      'location',
      'mapEmbedUrl',
      'workingHours',
      'footerTagline',
      'copyrightText',
      'builtWithText',
      'defaultLanguage',
    ] as const;

    for (const key of scalarKeys) {
      if (parsed[key] !== undefined) {
        (settings as unknown as Record<string, unknown>)[key] = parsed[key];
      }
    }

    const plainSettings = settings.toObject();

    if (parsed.banner) {
      settings.banner = {
        ...plainSettings.banner,
        ...stripUndefined(parsed.banner as Record<string, unknown>),
      } as typeof settings.banner;
    }

    if (parsed.stats) {
      settings.stats = {
        ...plainSettings.stats,
        ...stripUndefined(parsed.stats as Record<string, unknown>),
      } as typeof settings.stats;
    }

    if (parsed.seo) {
      settings.seo = {
        ...plainSettings.seo,
        ...stripUndefined(parsed.seo as Record<string, unknown>),
      } as typeof settings.seo;
    }

    if (parsed.socialLinks) {
      settings.socialLinks = parsed.socialLinks.map((item, idx) => ({
        platform: item.platform,
        label: item.label,
        url: item.url,
        icon: item.icon || 'Globe',
        order: item.order ?? idx + 1,
        visible: item.visible ?? true,
      }));
    }

    if (parsed.footer) {
      const currentFooter = plainSettings.footer || {};
      settings.footer = {
        ...currentFooter,
        ...stripUndefined(parsed.footer as Record<string, unknown>),
        appDownload: {
          ...(currentFooter.appDownload || {}),
          ...stripUndefined((parsed.footer.appDownload || {}) as Record<string, unknown>),
        },
        newsletter: {
          ...(currentFooter.newsletter || {}),
          ...stripUndefined((parsed.footer.newsletter || {}) as Record<string, unknown>),
        },
        trustStrip: {
          ...(currentFooter.trustStrip || {}),
          ...stripUndefined((parsed.footer.trustStrip || {}) as Record<string, unknown>),
          items: parsed.footer.trustStrip?.items
            ? parsed.footer.trustStrip.items.map((it, idx) => ({
                icon: it.icon || 'ShieldCheck',
                title: it.title,
                description: it.description,
                visible: it.visible ?? true,
                order: it.order ?? idx + 1,
              }))
            : currentFooter.trustStrip?.items || [],
        },
      } as typeof settings.footer;
    }

    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}
