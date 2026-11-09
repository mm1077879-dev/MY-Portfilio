import type { Response } from 'express';
import { Notification, type INotification } from '../models';

const adminStreams = new Map<string, Set<Response>>();

export function subscribeAdminNotifications(
  adminId: string,
  response: Response
): () => void {
  const streams = adminStreams.get(adminId) || new Set<Response>();
  streams.add(response);
  adminStreams.set(adminId, streams);

  return () => {
    streams.delete(response);
    if (streams.size === 0) adminStreams.delete(adminId);
  };
}

export function emitAdminNotification(notification: INotification): void {
  const payload = JSON.stringify({
    _id: String(notification._id),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    targetUrl: notification.targetUrl,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  for (const streams of adminStreams.values()) {
    for (const response of streams) {
      if (!response.destroyed && !response.writableEnded) {
        response.write(`event: notification\ndata: ${payload}\n\n`);
      }
    }
  }
}

export async function createContactMessageNotification(input: {
  messageId: string;
  customerName: string;
  subject: string;
}): Promise<INotification> {
  const eventKey = `contact-message:${input.messageId}`;
  try {
    const notification = await Notification.create({
      eventKey,
      type: 'contact_message',
      title: 'New contact inquiry',
      message: `${input.customerName}: ${input.subject}`.slice(0, 240),
      relatedEntityType: 'message',
      relatedEntityId: input.messageId,
      targetUrl: `/admin/messages?selected=${encodeURIComponent(input.messageId)}`,
      recipientRole: 'admin',
      isRead: false,
    });
    emitAdminNotification(notification);
    return notification;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const existing = await Notification.findOne({ eventKey });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function createNewsletterSubscriptionNotification(
  subscriberId: string
): Promise<INotification> {
  const eventKey = `newsletter-subscription:${subscriberId}`;
  try {
    const notification = await Notification.create({
      eventKey,
      type: 'newsletter_subscription',
      title: 'New newsletter subscriber',
      message: 'A new subscriber joined the newsletter.',
      relatedEntityType: 'newsletter_subscriber',
      relatedEntityId: subscriberId,
      targetUrl: '/admin/newsletter',
      recipientRole: 'admin',
      isRead: false,
    });
    emitAdminNotification(notification);
    return notification;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const existing = await Notification.findOne({ eventKey });
      if (existing) return existing;
    }
    throw error;
  }
}
