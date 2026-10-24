import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSession extends Document {
  sessionId: string;
  orderId: string;
  amount: number;
  coins: number;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderTitle: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  paymentId?: string;
  confirmedAt?: Date;
  rejectedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSessionSchema = new Schema<IPaymentSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    coins: {
      type: Number,
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderTitle: {
      type: String,
      default: 'BGCoin Wallet Top-Up',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: String,
    },
    confirmedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentSession = mongoose.model<IPaymentSession>(
  'PaymentSession',
  paymentSessionSchema
);
