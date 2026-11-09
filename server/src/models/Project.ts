import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  category: 'E-Commerce' | 'SaaS' | 'Web Apps' | 'Dashboards' | 'Business';
  shortDescription: string;
  overview: string;
  thumbnail: string;
  screenshots: string[];
  technologies: string[];
  features: string[];
  challenges: string;
  solutions: string;
  results: string;
  liveUrl: string;
  caseStudyUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
  order: number;
  views: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['E-Commerce', 'SaaS', 'Web Apps', 'Dashboards', 'Business'],
      required: true,
      index: true,
    },
    shortDescription: { type: String, required: true, trim: true, maxlength: 280 },
    overview: { type: String, default: '' },
    thumbnail: { type: String, required: true },
    screenshots: { type: [String], default: [] },
    technologies: { type: [String], default: [], index: true },
    features: { type: [String], default: [] },
    challenges: { type: String, default: '' },
    solutions: { type: String, default: '' },
    results: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    caseStudyUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
    views: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

ProjectSchema.index({ published: 1, featured: -1, order: 1, createdAt: -1 });
ProjectSchema.index({ title: 'text', shortDescription: 'text', technologies: 'text' });

export const Project =
  (mongoose.models.Project as mongoose.Model<IProject>) ||
  mongoose.model<IProject>('Project', ProjectSchema);
