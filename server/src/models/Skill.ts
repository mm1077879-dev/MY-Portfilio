import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Tools';
  icon: string;
  proficiency: number;
  description: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps & Tools'],
      required: true,
      index: true,
    },
    icon: { type: String, default: 'Code2' },
    proficiency: { type: Number, required: true, min: 1, max: 100, default: 90 },
    description: { type: String, default: '', maxlength: 220 },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

SkillSchema.index({ visible: 1, order: 1 });

export const Skill =
  (mongoose.models.Skill as mongoose.Model<ISkill>) ||
  mongoose.model<ISkill>('Skill', SkillSchema);
