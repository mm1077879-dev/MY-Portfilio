import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true, maxlength: 260 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, default: 'General', index: true },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

FAQSchema.index({ visible: 1, order: 1 });

export const FAQ =
  (mongoose.models.FAQ as mongoose.Model<IFAQ>) ||
  mongoose.model<IFAQ>('FAQ', FAQSchema);
