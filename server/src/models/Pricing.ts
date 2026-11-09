import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  packageName: string;
  audienceLabel: string;
  price: string;
  currency: string;
  billingType: 'One-Time' | 'Monthly' | 'Custom';
  description: string;
  features: string[];
  featured: boolean;
  ctaText: string;
  ctaLink: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>(
  {
    packageName: { type: String, required: true, trim: true, maxlength: 80 },
    audienceLabel: { type: String, default: 'For growing businesses', maxlength: 120 },
    price: { type: String, required: true, trim: true, maxlength: 50 },
    currency: { type: String, default: 'USD' },
    billingType: {
      type: String,
      enum: ['One-Time', 'Monthly', 'Custom'],
      default: 'One-Time',
    },
    description: { type: String, default: '', maxlength: 300 },
    features: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    ctaText: { type: String, default: 'Get Started' },
    ctaLink: { type: String, default: '/contact' },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

PricingSchema.index({ visible: 1, order: 1 });

export const Pricing =
  (mongoose.models.Pricing as mongoose.Model<IPricing>) ||
  mongoose.model<IPricing>('Pricing', PricingSchema);
