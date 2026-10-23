import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  industry?: string;
  size?: string;
  gstin?: string;
  pan?: string;
  logo?: string;
  isKycVerified: boolean;
  isActive: boolean;
  ownerId: mongoose.Types.ObjectId;
  settings: {
    defaultVerificationTypes: string[];
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      zipCode: String,
    },
    industry: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    gstin: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    isKycVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    settings: {
      defaultVerificationTypes: {
        type: [String],
        default: ['employment', 'education', 'identity'],
      },
      notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
