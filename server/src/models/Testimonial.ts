import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  clientName: string;
  clientImage: string;
  company: string;
  position: string;
  review: string;
  rating: number;
  projectRef?: mongoose.Types.ObjectId;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true, trim: true, maxlength: 100 },
    clientImage: { type: String, default: '' },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    review: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    projectRef: { type: Schema.Types.ObjectId, ref: 'Project' },
    featured: { type: Boolean, default: true, index: true },
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

TestimonialSchema.index({ published: 1, featured: -1, order: 1 });

export const Testimonial =
  (mongoose.models.Testimonial as mongoose.Model<ITestimonial>) ||
  mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
