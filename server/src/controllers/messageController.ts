import { Request, Response, NextFunction } from 'express';
import { Message } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  contactMessageCreateSchema,
  messageAdminUpdateSchema,
} from '../validations/schemas';
import { createPrivacyVisitorHash, parsePositiveInt } from '../utils/sanitize';
import {
  sendAdminReplyEmail,
  sendContactMessageNotification,
} from '../services/emailService';
import { AppError } from '../utils/AppError';
import { createContactMessageNotification } from '../services/notificationService';

export async function submitContactMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = contactMessageCreateSchema.parse(req.body);
    const dateBucket = new Date().toISOString().slice(0, 10);
    const ipHash = createPrivacyVisitorHash(
      req.ip || '0.0.0.0',
      String(req.headers['user-agent'] || ''),
      dateBucket
    );

    const created = await Message.create({
      fullName: parsed.fullName,
      email: parsed.email,
      service: parsed.service || 'General Inquiry',
      subject: parsed.subject,
      message: parsed.message,
      status: 'New',
      ipHash,
      userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
    });

    try {
      await createContactMessageNotification({
        messageId: String(created._id),
        customerName: created.fullName,
        subject: created.subject,
      });
    } catch (notificationError) {
      console.error('[Notifications] Failed to persist contact inquiry notification.', notificationError);
    }

    void sendContactMessageNotification({
      messageId: String(created._id),
      fullName: created.fullName,
      email: created.email,
      service: created.service,
      subject: created.subject,
      message: created.message,
      createdAt: created.createdAt,
    });

    res.status(201).json({
      success: true,
      data: {
        id: created._id,
        status: created.status,
        createdAt: created.createdAt,
        message: 'Thank you! Your inquiry has been received and saved.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filter: Record<string, unknown> = {};
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    if (status && status !== 'All') {
      filter.status = status;
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { subject: regex },
        { message: regex },
        { service: regex },
      ];
    }

    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 25, 50);
    const skip = (page - 1) * limit;

    const [items, total, unreadCount, newCount, readCount, repliedCount, archivedCount] =
      await Promise.all([
        Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Message.countDocuments(filter),
        Message.countDocuments({ status: 'New' }),
        Message.countDocuments({ status: 'New' }),
        Message.countDocuments({ status: 'Read' }),
        Message.countDocuments({ status: 'Replied' }),
        Message.countDocuments({ status: 'Archived' }),
      ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        counts: {
          unread: unreadCount,
          New: newCount,
          Read: readCount,
          Replied: repliedCount,
          Archived: archivedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMessageById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
    }
    res.status(200).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
}

export async function updateMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = messageAdminUpdateSchema.parse(req.body);
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
    }

    let emailDeliveryNote: string | null = null;

    if (parsed.status) {
      msg.status = parsed.status;
    }

    if (parsed.replyBody !== undefined && parsed.replyBody.trim().length > 0) {
      msg.replyBody = parsed.replyBody.trim();
      msg.repliedAt = new Date();
      msg.status = 'Replied';

      if (parsed.sendEmailReply) {
        const delivery = await sendAdminReplyEmail({
          to: msg.email,
          subject: msg.subject,
          replyBody: msg.replyBody,
          recipientName: msg.fullName,
        });
        msg.emailDelivered = delivery.sent;
        emailDeliveryNote = delivery.message;
      }
    }

    await msg.save();

    const [unreadCount, newCount, readCount, repliedCount, archivedCount] = await Promise.all([
      Message.countDocuments({ status: 'New' }),
      Message.countDocuments({ status: 'New' }),
      Message.countDocuments({ status: 'Read' }),
      Message.countDocuments({ status: 'Replied' }),
      Message.countDocuments({ status: 'Archived' }),
    ]);

    res.status(200).json({
      success: true,
      data: msg,
      meta: {
        emailDeliveryNote,
        counts: {
          unread: unreadCount,
          New: newCount,
          Read: readCount,
          Replied: repliedCount,
          Archived: archivedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Message not found.', 404, 'MESSAGE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Message deleted permanently.' },
    });
  } catch (err) {
    next(err);
  }
}
