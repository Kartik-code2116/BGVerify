import mongoose, { Document, Schema } from 'mongoose';

export interface IPortal extends Document {
  name: string;
  category: 'education' | 'employment' | 'identity' | 'criminal' | 'custom';
  loginUrl: string;
  searchUrl: string;
  username: string;
  password?: string;
  email?: string;
  apiKey?: string;
  authNotes?: string;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  checksCount: number;
  lastTestedAt?: Date;
  testStatus: 'success' | 'failed' | 'untested';
  testScreenshot?: string;
  testLogs?: string[];
  isLiveSnapshot?: boolean;
  captureType?: 'live_portal_capture' | 'simulated_fallback';
  createdAt: Date;
  updatedAt: Date;
}

const PortalSchema = new Schema<IPortal>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['education', 'employment', 'identity', 'criminal', 'custom'],
      default: 'education',
    },
    loginUrl: { type: String, required: true, trim: true },
    searchUrl: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    password: { type: String, default: '' },
    email: { type: String, default: '', trim: true },
    apiKey: { type: String, default: '', trim: true },
    authNotes: { type: String, default: '' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    checksCount: { type: Number, default: 0 },
    lastTestedAt: { type: Date },
    testStatus: {
      type: String,
      enum: ['success', 'failed', 'untested'],
      default: 'untested',
    },
    testScreenshot: { type: String },
    testLogs: [{ type: String }],
    isLiveSnapshot: { type: Boolean, default: false },
    captureType: {
      type: String,
      enum: ['live_portal_capture', 'simulated_fallback'],
      default: 'simulated_fallback',
    },
  },
  { timestamps: true }
);

PortalSchema.index({ organizationId: 1, name: 1 });

export const Portal = mongoose.model<IPortal>('Portal', PortalSchema);
