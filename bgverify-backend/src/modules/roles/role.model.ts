import mongoose, { Schema, Document } from 'mongoose';

export interface IJobRole extends Document {
  title: string;
  sector: string;
  department?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  openPositions: number;
  filledPositions: number;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  locationType: 'remote' | 'hybrid' | 'onsite';
  location?: string;
  requiredChecks: string[];
  targetJoiningDate?: Date;
  status: 'active' | 'paused' | 'closed';
  description?: string;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobRoleSchema = new Schema<IJobRole>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    openPositions: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    filledPositions: {
      type: Number,
      default: 0,
      min: 0,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid',
    },
    locationType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'hybrid',
    },
    location: {
      type: String,
      trim: true,
      default: 'Headquarters',
    },
    requiredChecks: {
      type: [String],
      default: ['education', 'employment', 'identity'],
    },
    targetJoiningDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const JobRole = mongoose.model<IJobRole>('JobRole', jobRoleSchema);
