import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  organizationId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    rollNumber?: string;
    startYear?: number;
    endYear?: number;
    grade?: string;
  }>;
  employment?: Array<{
    company: string;
    designation: string;
    department?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    employeeId?: string;
    ctc?: string;
    reportingManager?: string;
  }>;
  consentGiven: boolean;
  consentDate?: Date;
  liveSelfieUrl?: string;
  targetRole?: string;
  sector?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  jobRoleId?: mongoose.Types.ObjectId;
  hiringStage?: 'applied' | 'verifying' | 'cleared' | 'flagged' | 'hired' | 'rejected';
  clearanceScore?: number;
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileSize?: string;
    storageKey?: string;
    sha256?: string;
    uploadedAt: Date;
    status: 'uploaded' | 'verified' | 'rejected';
  }>;
  status: 'pending_consent' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

const candidateSchema = new Schema<ICandidate>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
    dateOfBirth: {
      type: Date,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    passportNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: String,
        rollNumber: String,
        startYear: Number,
        endYear: Number,
        grade: String,
      },
    ],
    employment: [
      {
        company: { type: String, required: true },
        designation: { type: String, required: true },
        department: String,
        startDate: Schema.Types.Mixed,
        endDate: Schema.Types.Mixed,
        employeeId: String,
        ctc: String,
        reportingManager: String,
      },
    ],
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentDate: {
      type: Date,
    },
    liveSelfieUrl: {
      type: String,
    },
    targetRole: {
      type: String,
      trim: true,
      index: true,
    },
    sector: {
      type: String,
      trim: true,
      index: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    jobRoleId: {
      type: Schema.Types.ObjectId,
      ref: 'JobRole',
      index: true,
    },
    hiringStage: {
      type: String,
      enum: ['applied', 'verifying', 'cleared', 'flagged', 'hired', 'rejected'],
      default: 'applied',
      index: true,
    },
    clearanceScore: {
      type: Number,
      default: 0,
    },
    documents: [
      {
        documentType: { type: String, required: true },
        fileName: { type: String, required: true },
        fileSize: String,
        storageKey: String,
        sha256: String,
        uploadedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['uploaded', 'verified', 'rejected'],
          default: 'uploaded',
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending_consent', 'active', 'completed', 'archived'],
      default: 'pending_consent',
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

candidateSchema.virtual('fullName').get(function (this: ICandidate) {
  return `${this.firstName} ${this.lastName}`;
});

// Compound index for uniqueness per organization
candidateSchema.index({ email: 1, organizationId: 1 }, { unique: true });

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
