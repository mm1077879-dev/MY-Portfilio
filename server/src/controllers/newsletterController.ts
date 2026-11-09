import { Request, Response, NextFunction } from 'express';
import { NewsletterSubscriber } from '../models';
import { newsletterSubscriptionSchema } from '../validations/schemas';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendEmailIfConfigured } from '../services/emailService';
import { createNewsletterSubscriptionNotification } from '../services/notificationService';

export async function subscribeNewsletter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parseResult = newsletterSubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new AppError(
        issue?.message || 'Invalid email address provided for subscription.',
        400,
        'VALIDATION_ERROR'
      );
    }

    const { email, source } = parseResult.data;
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    const userAgent = (req.headers['user-agent'] as string) || '';

    // Check for existing subscriber
    const existing = await NewsletterSubscriber.findOne({ email });

    if (existing) {
      if (existing.status === 'active') {
        res.status(200).json({
          success: true,
          message: "You're already subscribed to our newsletter! Thank you for staying connected.",
          data: {
            id: existing._id,
            email: existing.email,
            status: existing.status,
            alreadySubscribed: true,
          },
        });
        return;
      }

      // Reactivate previously unsubscribed email
      existing.status = 'active';
      existing.subscribedAt = new Date();
      existing.confirmedAt = new Date();
      existing.emailVerified = false;
      existing.ipAddress = clientIp;
      existing.userAgent = userAgent;
      await existing.save();

      res.status(200).json({
        success: true,
        message: 'Your newsletter subscription has been successfully reactivated!',
        data: {
          id: existing._id,
          email: existing.email,
          status: existing.status,
          subscribedAt: existing.subscribedAt,
          emailVerified: false,
          reactivated: true,
        },
      });
      return;
    }

    // Create new subscriber in MongoDB (persistence guaranteed)
    const newSubscriber = await NewsletterSubscriber.create({
      email,
      status: 'active',
      source: source || 'footer_subscription',
      ipAddress: clientIp,
      userAgent,
      subscribedAt: new Date(),
      emailVerified: false,
      confirmedAt: new Date(),
    });

    try {
      await createNewsletterSubscriptionNotification(String(newSubscriber._id));
    } catch (notificationError) {
      console.error('[Notifications] Failed to persist newsletter signup notification.', notificationError);
    }

    // Attempt email delivery if SMTP is configured (non-blocking)
    let emailDeliveryAttempted = false;
    let emailDeliverySuccess = false;
    try {
      const emailRes = await sendEmailIfConfigured({
        to: email,
        subject: 'Welcome to Mahim Dev Tech Updates & Architectural Insights',
        text: `Hello,\n\nThank you for subscribing to Mahim Dev's newsletter! You'll receive monthly engineering case studies, full-stack architecture deep dives, and digital product launches.\n\nBest regards,\nMahim Dev Team`,
        html: `
          <div style="font-family: sans-serif; background: #030514; color: #F5F5FF; padding: 24px; border-radius: 12px;">
            <h2 style="color: #9B1CFF; margin-top: 0;">Welcome to Mahim Dev Updates!</h2>
            <p style="color: #B8C4E5; line-height: 1.6;">Thank you for subscribing. You will receive engineering case studies, modern full-stack patterns, and project updates.</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748B;">You received this email because you subscribed on mahimdev.com.</p>
          </div>
        `,
      });
      emailDeliveryAttempted = true;
      emailDeliverySuccess = emailRes.sent;
    } catch {
      emailDeliveryAttempted = false;
      emailDeliverySuccess = false;
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter! Your subscription is active.',
      data: {
        id: newSubscriber._id,
        email: newSubscriber.email,
        status: newSubscriber.status,
        subscribedAt: newSubscriber.subscribedAt,
        emailVerified: false,
        confirmedAt: newSubscriber.confirmedAt,
        deliveryReport: {
          smtpConfigured: emailDeliveryAttempted,
          delivered: emailDeliverySuccess,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getNewsletterSubscribers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const search = String(req.query.search || '').trim().toLowerCase();

    const query: Record<string, unknown> = {};
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const [total, activeCount, subscribers] = await Promise.all([
      NewsletterSubscriber.countDocuments(query),
      NewsletterSubscriber.countDocuments({ status: 'active' }),
      NewsletterSubscriber.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: subscribers,
      meta: {
        total,
        activeCount,
        unsubscribedCount: Math.max(0, total - activeCount),
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNewsletterSubscriber(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) {
      throw new AppError('Newsletter subscriber not found.', 404, 'NOT_FOUND');
    }

    await subscriber.deleteOne();

    res.status(200).json({
      success: true,
      data: { id, message: 'Subscriber deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
