import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  path: string;
  visitorHash: string;
  referrer: string;
  projectSlug?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  dateBucket: string; // YYYY-MM-DD
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    path: { type: String, required: true, trim: true, index: true },
    visitorHash: { type: String, required: true, index: true },
    referrer: { type: String, default: 'Direct', index: true },
    projectSlug: { type: String, index: true },
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile'],
      default: 'desktop',
    },
    dateBucket: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 }, // 180-day retention policy
  },
  { timestamps: false }
);

AnalyticsSchema.index({ dateBucket: 1, path: 1 });
AnalyticsSchema.index({ dateBucket: 1, visitorHash: 1 });

export const Analytics =
  (mongoose.models.Analytics as mongoose.Model<IAnalytics>) ||
  mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
