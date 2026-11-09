import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaAsset extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  provider: 'local' | 'cloudinary';
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    provider: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const MediaAsset =
  (mongoose.models.MediaAsset as mongoose.Model<IMediaAsset>) ||
  mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
