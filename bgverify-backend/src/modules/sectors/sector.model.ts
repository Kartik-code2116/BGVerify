import mongoose, { Schema, Document } from 'mongoose';

export interface ISector extends Document {
  name: string;
  color: string;
  description?: string;
  defaultChecks: string[];
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sectorSchema = new Schema<ISector>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: 'cyan',
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    defaultChecks: {
      type: [String],
      default: ['education', 'employment', 'identity'],
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

sectorSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export const Sector = mongoose.model<ISector>('Sector', sectorSchema);
