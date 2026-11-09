import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  status: 'active' | 'unsubscribed';
  source: string;
  ipAddress?: string;
  userAgent?: string;
  subscribedAt?: Date;
  emailVerified?: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
      index: true,
    },
    source: {
      type: String,
      default: 'footer_subscription',
      maxlength: 60,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const NewsletterSubscriber =
  (mongoose.models.NewsletterSubscriber as mongoose.Model<INewsletterSubscriber>) ||
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
