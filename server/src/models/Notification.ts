import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'contact_message' | 'newsletter_subscription';

export interface INotification extends Document {
  eventKey: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: 'message' | 'newsletter_subscriber';
  relatedEntityId: mongoose.Types.ObjectId;
  targetUrl: string;
  recipientRole: 'admin';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    eventKey: { type: String, required: true, unique: true, trim: true, maxlength: 180 },
    type: {
      type: String,
      enum: ['contact_message', 'newsletter_subscription'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 240 },
    relatedEntityType: {
      type: String,
      enum: ['message', 'newsletter_subscriber'],
      required: true,
    },
    relatedEntityId: { type: Schema.Types.ObjectId, required: true },
    targetUrl: {
      type: String,
      required: true,
      validate: (value: string) =>
        value.startsWith('/admin/messages?selected=') || value === '/admin/newsletter',
    },
    recipientRole: { type: String, enum: ['admin'], default: 'admin', required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientRole: 1, createdAt: -1 });
NotificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema);
