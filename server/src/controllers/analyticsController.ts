import { Request, Response, NextFunction } from 'express';
import {
  Analytics,
  Project,
  Message,
  Testimonial,
  Service,
  MediaAsset,
} from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { analyticsTrackSchema } from '../validations/schemas';
import {
  createPrivacyVisitorHash,
  normalizeAnalyticsPath,
  normalizeReferrerSource,
  parsePositiveInt,
} from '../utils/sanitize';
import { getDatabaseHealth } from '../config/database';
import { env, isCloudinaryConfigured, isSmtpConfigured } from '../config/env';
import { AppError } from '../utils/AppError';

const publicAnalyticsMatch = () => ({
  path: {
    $not: /^(?:\/admin(?:\/|$)|\/api(?:\/|$)|\/src(?:\/|$)|\/assets(?:\/|$)|\/uploads(?:\/|$)|\/favicon(?:\.|\/|$)|\/robots\.txt$|\/sitemap\.xml$|\/health(?:\/|$)|\/\.well-known(?:\/|$)|\/.*\.(?:js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf|map|json|xml|txt)$)/i,
  },
});

export async function trackPageVisit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = analyticsTrackSchema.parse(req.body);
    const normalizedPath = normalizeAnalyticsPath(parsed.path);
    if (!normalizedPath) {
      throw new AppError('Public page path is invalid for analytics tracking.', 422, 'INVALID_ANALYTICS_PATH');
    }

    const dateBucket = new Date().toISOString().slice(0, 10);
    const visitorHash = createPrivacyVisitorHash(
      req.ip || '0.0.0.0',
      String(req.headers['user-agent'] || ''),
      dateBucket
    );

    const duplicate = await Analytics.findOne({
      path: normalizedPath,
      visitorHash,
      dateBucket,
      createdAt: { $gte: new Date(Date.now() - 30 * 1000) },
    }).lean();

    if (duplicate) {
      res.status(201).json({ success: true, data: { recorded: false, duplicate: true } });
      return;
    }

    await Analytics.create({
      path: normalizedPath,
      visitorHash,
      referrer: normalizeReferrerSource(parsed.referrer || req.headers.referer || 'Direct'),
      projectSlug: parsed.projectSlug,
      deviceType: parsed.deviceType,
      dateBucket,
    });

    res.status(201).json({ success: true, data: { recorded: true } });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyticsOverview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = parsePositiveInt(req.query.days, 14, 90);
    const sinceDate = new Date(Date.now() - (days - 1) * 86400000);
    const sinceBucket = sinceDate.toISOString().slice(0, 10);

    const [
      totalProjects,
      publishedProjects,
      totalServices,
      totalMessages,
      unreadMessages,
      totalPageViews,
      uniqueVisitorHashes,
      testimonials,
      recentMessages,
      topProjects,
      dailyBuckets,
      mediaCount,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ published: true }),
      Service.countDocuments({ published: true }),
      Message.countDocuments(),
      Message.countDocuments({ status: 'New' }),
      Analytics.countDocuments({ dateBucket: { $gte: sinceBucket }, ...publicAnalyticsMatch() }),
      Analytics.distinct('visitorHash', {
        dateBucket: { $gte: sinceBucket },
        ...publicAnalyticsMatch(),
      }),
      Testimonial.find({ published: true }).select('rating'),
      Message.find().sort({ createdAt: -1 }).limit(5),
      Project.find().sort({ views: -1, featured: -1, order: 1 }).limit(5),
      Analytics.aggregate([
        { $match: { dateBucket: { $gte: sinceBucket }, ...publicAnalyticsMatch() } },
        {
          $group: {
            _id: '$dateBucket',
            pageViews: { $sum: 1 },
            visitorsSet: { $addToSet: '$visitorHash' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            pageViews: 1,
            visitors: { $size: '$visitorsSet' },
          },
        },
        { $sort: { date: 1 } },
      ]),
      MediaAsset.countDocuments(),
    ]);

    const avgRating =
      testimonials.length > 0
        ? (
            testimonials.reduce((acc, item) => acc + (item.rating || 5), 0) /
            testimonials.length
          ).toFixed(1)
        : '5.0';

    // Build continuous daily timeline for selected date range
    const bucketMap = new Map<string, { pageViews: number; visitors: number }>();
    for (const row of dailyBuckets) {
      bucketMap.set(row.date, {
        pageViews: row.pageViews,
        visitors: row.visitors,
      });
    }

    // Count daily messages in the same range
    const messageBuckets = await Message.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          inquiries: { $sum: 1 },
        },
      },
    ]);
    const msgMap = new Map<string, number>();
    for (const m of messageBuckets) {
      msgMap.set(m._id, m.inquiries);
    }

    const chartSeries: Array<{
      date: string;
      label: string;
      pageViews: number;
      visitors: number;
      inquiries: number;
    }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const entry = bucketMap.get(iso) || { pageViews: 0, visitors: 0 };
      chartSeries.push({
        date: iso,
        label,
        pageViews: entry.pageViews,
        visitors: entry.visitors,
        inquiries: msgMap.get(iso) || 0,
      });
    }

    const dbHealth = getDatabaseHealth();

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalProjects,
          publishedProjects,
          totalServices,
          totalMessages,
          unreadMessages,
          totalVisitors: uniqueVisitorHashes.length,
          totalPageViews,
          clientRating: Number(avgRating),
        },
        days,
        chartSeries,
        recentMessages,
        topProjects,
        systemStatus: {
          environment: env.NODE_ENV,
          apiVersion: 'v1',
          uptimeSeconds: Math.floor(process.uptime()),
          database: dbHealth,
          storage: {
            provider: isCloudinaryConfigured() ? 'Cloudinary Cloud' : 'Local Disk (/uploads)',
            cloudinaryConfigured: isCloudinaryConfigured(),
            storedAssetsCount: mediaCount,
          },
          email: {
            smtpConfigured: isSmtpConfigured(),
            statusLabel: isSmtpConfigured()
              ? 'SMTP Ready'
              : 'Inbox DB Only (Set EMAIL_SERVICE_* for outbound email)',
          },
          security: {
            jwtAuth: true,
            rateLimiting: true,
            helmetHeaders: true,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getVisitorsAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = parsePositiveInt(req.query.days, 30, 90);
    const sinceBucket = new Date(Date.now() - (days - 1) * 86400000)
      .toISOString()
      .slice(0, 10);

    const [byDevice, byDate] = await Promise.all([
      Analytics.aggregate([
        { $match: { dateBucket: { $gte: sinceBucket }, ...publicAnalyticsMatch() } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $project: { _id: 0, device: '$_id', count: 1 } },
      ]),
      Analytics.aggregate([
        { $match: { dateBucket: { $gte: sinceBucket }, ...publicAnalyticsMatch() } },
        {
          $group: {
            _id: '$dateBucket',
            pageViews: { $sum: 1 },
            visitors: { $addToSet: '$visitorHash' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            pageViews: 1,
            uniqueVisitors: { $size: '$visitors' },
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        days,
        byDevice,
        byDate,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPagesAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = parsePositiveInt(req.query.days, 30, 90);
    const sinceBucket = new Date(Date.now() - (days - 1) * 86400000)
      .toISOString()
      .slice(0, 10);

    const [popularPages, referrers, projectViews] = await Promise.all([
      Analytics.aggregate([
        { $match: { dateBucket: { $gte: sinceBucket }, ...publicAnalyticsMatch() } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $project: { _id: 0, path: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 12 },
      ]),
      (async () => {
        const rows = await Analytics.find({
          dateBucket: { $gte: sinceBucket },
          ...publicAnalyticsMatch(),
        })
          .select('referrer')
          .lean();

        const counts = new Map<string, number>();

        for (const row of rows) {
          const source = normalizeReferrerSource((row as { referrer?: unknown })?.referrer);
          counts.set(source, (counts.get(source) ?? 0) + 1);
        }

        return [...counts.entries()]
          .map(([source, visits]) => ({ source, visits }))
          .sort((a, b) => b.visits - a.visits || a.source.localeCompare(b.source))
          .slice(0, 10);
      })(),
      Project.find().select('title slug category views featured published').sort({ views: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        days,
        popularPages,
        referrers,
        projectViews,
      },
    });
  } catch (err) {
    next(err);
  }
}
