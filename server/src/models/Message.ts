import mongoose, { Schema, Document } from 'mongoose';

export type MessageStatus = 'New' | 'Read' | 'Replied' | 'Archived';

export interface IMessage extends Document {
  fullName: string;
  email: string;
  service: string;
  subject: string;
  message: string;
  status: MessageStatus;
  replyBody?: string;
  repliedAt?: Date;
  emailDelivered?: boolean;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    service: { type: String, default: 'General Inquiry', trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Archived'],
      default: 'New',
      index: true,
    },
    replyBody: { type: String, default: '' },
    repliedAt: { type: Date },
    emailDelivered: { type: Boolean, default: false },
    ipHash: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ fullName: 'text', email: 'text', subject: 'text', message: 'text' });

export const Message =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>('Message', MessageSchema);
