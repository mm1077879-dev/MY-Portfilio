import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin' | 'editor';
  isInitialAdmin: boolean;
  avatar: string;
  bio: string;
  twoFactorNote: string;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  authVersion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'editor'],
      default: 'superadmin',
      index: true,
    },
    isInitialAdmin: {
      type: Boolean,
      default: false,
      select: false,
    },
    avatar: {
      type: String,
      default: '/src/assets/images/hero_developer_portrait_1793526368603.jpg',
    },
    bio: {
      type: String,
      default: 'Lead Full-Stack Architect & Portfolio Owner',
      maxlength: 500,
    },
    twoFactorNote: {
      type: String,
      default: 'JWT HttpOnly Cookie + Rate-Limited Login Protection Active',
      maxlength: 200,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    authVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

AdminSchema.index(
  { isInitialAdmin: 1 },
  { unique: true, partialFilterExpression: { isInitialAdmin: true } }
);

AdminSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const Admin =
  (mongoose.models.Admin as mongoose.Model<IAdmin>) ||
  mongoose.model<IAdmin>('Admin', AdminSchema);
