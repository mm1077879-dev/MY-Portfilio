import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  slug: string;
  icon: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  deliverables: string[];
  startingPrice: string;
  timelineEstimate: string;
  ctaText: string;
  ctaLink: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    icon: { type: String, required: true, default: 'Code2' },
    image: { type: String, default: '' },
    shortDescription: { type: String, required: true, trim: true, maxlength: 260 },
    fullDescription: { type: String, default: '' },
    features: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    startingPrice: { type: String, default: '' },
    timelineEstimate: { type: String, default: '2 - 4 Weeks' },
    ctaText: { type: String, default: 'Learn More' },
    ctaLink: { type: String, default: '/contact' },
    featured: { type: Boolean, default: true, index: true },
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ published: 1, order: 1 });

export const Service =
  (mongoose.models.Service as mongoose.Model<IService>) ||
  mongoose.model<IService>('Service', ServiceSchema);
