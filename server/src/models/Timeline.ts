import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeline extends Document {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'education' | 'career' | 'milestone';
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema<ITimeline>(
  {
    year: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['education', 'career', 'milestone'],
      default: 'milestone',
    },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

TimelineSchema.index({ published: 1, order: 1 });

export const Timeline =
  (mongoose.models.Timeline as mongoose.Model<ITimeline>) ||
  mongoose.model<ITimeline>('Timeline', TimelineSchema);
