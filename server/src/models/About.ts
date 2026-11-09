import mongoose, { Schema, Document } from 'mongoose';

export interface IWhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

export interface IWorkflowStep {
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
}

export interface IAbout extends Document {
  badgeText: string;
  headline: string;
  developerName: string;
  subtitle: string;
  biography: string;
  extendedBio: string;
  profileImage: string;
  cvFileUrl: string;
  trustText: string;
  experienceYears: string;
  projectsDelivered: string;
  happyClients: string;
  clientSatisfaction: string;
  whyChooseMe: IWhyChooseItem[];
  workflowSteps: IWorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
  {
    badgeText: { type: String, default: 'About Me' },
    headline: { type: String, default: "Hi, I'm Mahim Dev" },
    developerName: { type: String, default: 'Mahim Dev' },
    subtitle: { type: String, default: 'Full-Stack Developer & Problem Solver' },
    biography: {
      type: String,
      default:
        'I design and engineer resilient, high-converting web platforms, custom SaaS applications, and modern eCommerce ecosystems using TypeScript, React, Next.js, Node.js, and MongoDB.',
    },
    extendedBio: {
      type: String,
      default:
        'Over the past several years, I have partnered with founders, startups, and established businesses worldwide to transform complex ideas into clean, scalable software products. My focus combines sub-second frontend performance with secure, maintainable backend architecture.',
    },
    profileImage: {
      type: String,
      default: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
    },
    cvFileUrl: { type: String, default: '/api/v1/about/cv-download' },
    trustText: {
      type: String,
      default: 'Trusted by 50+ startups & growing digital brands worldwide',
    },
    experienceYears: { type: String, default: '2+ Years' },
    projectsDelivered: { type: String, default: '100+' },
    happyClients: { type: String, default: '50+' },
    clientSatisfaction: { type: String, default: '99%' },
    whyChooseMe: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          icon: { type: String, default: 'Zap' },
        },
      ],
      default: [],
    },
    workflowSteps: {
      type: [
        {
          stepNumber: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          icon: { type: String, default: 'Sparkles' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const About =
  (mongoose.models.About as mongoose.Model<IAbout>) ||
  mongoose.model<IAbout>('About', AboutSchema);
