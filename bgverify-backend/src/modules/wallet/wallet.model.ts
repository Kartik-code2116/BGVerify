import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'purchase' | 'debit' | 'refund' | 'bonus' | 'adjustment';

export interface IWallet extends Document {
  organizationId: mongoose.Types.ObjectId;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  totalRefunded: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: 'verification' | 'purchase' | 'refund' | 'manual';
  verificationId?: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchased: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalRefunded: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'debit', 'refund', 'bonus', 'adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: String,
    referenceType: {
      type: String,
      enum: ['verification', 'purchase', 'refund', 'manual'],
    },
    verificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Verification',
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for transaction history
walletTransactionSchema.index({ createdAt: -1 });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
export const WalletTransaction = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema
);
