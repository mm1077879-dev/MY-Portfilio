import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { parsePositiveInt } from '../utils/sanitize';
import { subscribeAdminNotifications } from '../services/notificationService';

export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 10, 50);
    const [items, total, unreadCount] = await Promise.all([
      Notification.find({ recipientRole: 'admin' })
        .select('_id type title message targetUrl isRead createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientRole: 'admin' }),
      Notification.countDocuments({ recipientRole: 'admin', isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), unreadCount },
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationUnreadCount(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await Notification.countDocuments({ recipientRole: 'admin', isRead: false });
    res.status(200).json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError('Invalid notification identifier.', 400, 'INVALID_ID');
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientRole: 'admin', isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true, runValidators: true }
    ).select('_id isRead readAt');
    if (notification) {
      res.status(200).json({ success: true, data: notification });
      return;
    }
    const existing = await Notification.findOne({
      _id: req.params.id,
      recipientRole: 'admin',
    }).select('_id isRead readAt');
    if (!existing) throw new AppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await Notification.updateMany(
      { recipientRole: 'admin', isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { runValidators: true }
    );
    res.status(200).json({ success: true, data: { modifiedCount: result.modifiedCount } });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError('Invalid notification identifier.', 400, 'INVALID_ID');
    }
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientRole: 'admin',
    }).select('_id');
    if (!deleted) throw new AppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
    res.status(200).json({ success: true, data: { id: String(deleted._id) } });
  } catch (error) {
    next(error);
  }
}

export function streamAdminNotifications(
  req: AuthenticatedRequest,
  res: Response
): void {
  const adminId = req.admin ? String(req.admin._id) : '';
  if (!adminId) {
    res.status(401).end();
    return;
  }

  res.status(200);
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 5000\nevent: connected\ndata: {}\n\n');

  const unsubscribe = subscribeAdminNotifications(adminId, res);
  const heartbeat = setInterval(() => {
    if (!res.destroyed && !res.writableEnded) res.write(': keep-alive\n\n');
  }, 25000);
  heartbeat.unref();

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}
