import mongoose, { Schema, Document } from 'mongoose';

export type VerificationType =
  | 'employment'
  | 'education'
  | 'address'
  | 'identity'
  | 'criminal'
  | 'court_records'
  | 'social_media'
  | 'passport'
  | 'driving_license'
  | 'professional_certification'
  | 'drug_test'
  | 'credit_check'
  | 'global_sanctions'
  | 'reference_check';

export type VerificationStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'waiting_response'
  | 'evidence_collected'
  | 'ai_review'
  | 'manual_review'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type VerificationResult =
  | 'match'
  | 'no_match'
  | 'partial_match'
  | 'needs_review'
  | 'insufficient_data'
  | 'pending';

export interface IVerification extends Document {
  candidateId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  verificationType: VerificationType;
  status: VerificationStatus;
  result: VerificationResult;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  bgcoinCost: number;
  isRefunded: boolean;
  inputData: Record<string, any>;
  collectedEvidence?: {
    screenshots?: string[];
    pdfs?: string[];
    htmlSnapshots?: string[];
    ocrResults?: string[];
    apiResponses?: string[];
  };
  aiAnalysis?: {
    confidence: number;
    summary: string;
    fieldComparisons: Array<{
      field: string;
      submitted: string;
      found: string;
      isMatch: boolean;
    }>;
    flags: string[];
    recommendedAction: string;
  };
  reviewerNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  completedAt?: Date;
  estimatedCompletionAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorLog?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationType: {
      type: String,
      enum: [
        'employment',
        'education',
        'address',
        'identity',
        'criminal',
        'court_records',
        'social_media',
        'passport',
        'driving_license',
        'professional_certification',
        'drug_test',
        'credit_check',
        'global_sanctions',
        'reference_check',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'in_progress',
        'waiting_response',
        'evidence_collected',
        'ai_review',
        'manual_review',
        'completed',
        'failed',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    result: {
      type: String,
      enum: [
        'match',
        'no_match',
        'partial_match',
        'needs_review',
        'insufficient_data',
        'pending',
      ],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    bgcoinCost: {
      type: Number,
      default: 1,
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    inputData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    collectedEvidence: {
      screenshots: [String],
      pdfs: [String],
      htmlSnapshots: [String],
      ocrResults: [String],
      apiResponses: [String],
    },
    aiAnalysis: {
      confidence: Number,
      summary: String,
      fieldComparisons: [
        {
          field: String,
          submitted: String,
          found: String,
          isMatch: Boolean,
        },
      ],
      flags: [String],
      recommendedAction: String,
    },
    reviewerNotes: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    completedAt: Date,
    estimatedCompletionAt: Date,
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    errorLog: [String],
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

// Compound indexes for common queries
verificationSchema.index({ organizationId: 1, status: 1 });
verificationSchema.index({ candidateId: 1, verificationType: 1 });
verificationSchema.index({ createdAt: -1 });

export const Verification = mongoose.model<IVerification>('Verification', verificationSchema);
