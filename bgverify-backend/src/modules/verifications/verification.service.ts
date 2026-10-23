import mongoose from 'mongoose';
import { Verification } from './verification.model';
import { Candidate } from '../candidates/candidate.model';
import { Wallet, WalletTransaction } from '../wallet/wallet.model';
import { AuditLog } from '../audit/audit.model';
import { CreateVerificationInput, UpdateVerificationInput } from './verification.validation';
import {
  NotFoundError,
  BadRequestError,
  InsufficientBalanceError,
  ForbiddenError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';

class VerificationService {
  /**
   * Create a new verification request. Deducts 1 BGCoin from the org wallet.
   */
  async create(
    input: CreateVerificationInput,
    userId: string,
    organizationId: string
  ) {
    // Verify candidate exists and belongs to the organization
    const candidate = await Candidate.findOne({
      _id: input.candidateId,
      organizationId,
    });
    if (!candidate) {
      throw new NotFoundError('Candidate not found in your organization');
    }

    // Check for duplicate verification
    const existing = await Verification.findOne({
      candidateId: input.candidateId,
      organizationId,
      verificationType: input.verificationType,
      status: { $nin: ['completed', 'failed', 'cancelled'] },
    });
    if (existing) {
      throw new BadRequestError(
        `A ${input.verificationType} verification is already in progress for this candidate`
      );
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ organizationId });
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    if (wallet.balance < 1) {
      throw new InsufficientBalanceError(
        'Insufficient BGCoin balance. Please top up your wallet.'
      );
    }

    // Deduct 1 BGCoin using atomic operation
    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: 1 } },
      {
        $inc: { balance: -1, totalSpent: 1 },
      },
      { new: true }
    );
    if (!updatedWallet) {
      throw new InsufficientBalanceError('Insufficient BGCoin balance (concurrent deduction).');
    }

    // Create the verification
    const verification = new Verification({
      candidateId: input.candidateId,
      organizationId,
      requestedBy: userId,
      verificationType: input.verificationType,
      priority: input.priority || 'medium',
      inputData: input.inputData || {},
      bgcoinCost: 1,
    });
    await verification.save();

    // Record wallet transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      organizationId,
      type: 'debit',
      amount: 1,
      balanceAfter: updatedWallet.balance,
      description: `${input.verificationType} verification for ${candidate.firstName} ${candidate.lastName}`,
      referenceType: 'verification',
      verificationId: verification._id,
      performedBy: userId,
    });

    // Audit log
    await AuditLog.create({
      userId,
      organizationId,
      action: 'verification.created',
      resourceType: 'verification',
      resourceId: verification._id.toString(),
      details: {
        verificationType: input.verificationType,
        candidateId: input.candidateId,
        bgcoinCost: 1,
      },
    });

    logger.info(
      `Verification created: ${verification._id} (${input.verificationType}) for candidate ${input.candidateId}`
    );

    return verification;
  }

  /**
   * List verifications with filters
   */
  async list(
    organizationId: string | null,
    filters: {
      status?: string;
      verificationType?: string;
      candidateId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const query: any = {};
    if (organizationId) query.organizationId = organizationId;
    if (filters.status) query.status = filters.status;
    if (filters.verificationType) query.verificationType = filters.verificationType;
    if (filters.candidateId) query.candidateId = filters.candidateId;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      Verification.find(query)
        .populate('candidateId', 'firstName lastName email')
        .populate('requestedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Verification.countDocuments(query),
    ]);

    return {
      verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get verification by ID
   */
  async getById(verificationId: string, organizationId?: string) {
    const query: any = { _id: verificationId };
    if (organizationId) query.organizationId = organizationId;

    const verification = await Verification.findOne(query)
      .populate('candidateId', 'firstName lastName email phone')
      .populate('requestedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }
    return verification;
  }

  /**
   * Update verification (admin or reviewer)
   */
  async update(
    verificationId: string,
    input: UpdateVerificationInput,
    userId: string,
    userRole: string
  ) {
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    // Only admin and authorized users can update
    if (userRole !== 'admin' && userRole !== 'hr_admin') {
      throw new ForbiddenError('You do not have permission to update this verification');
    }

    if (input.status) verification.status = input.status;
    if (input.result) verification.result = input.result;
    if (input.reviewerNotes) {
      verification.reviewerNotes = input.reviewerNotes;
      verification.reviewedBy = new mongoose.Types.ObjectId(userId);
      verification.reviewedAt = new Date();
    }

    if (input.status === 'completed') {
      verification.completedAt = new Date();
    }

    await verification.save();

    // Audit log
    await AuditLog.create({
      userId,
      organizationId: verification.organizationId,
      action: 'verification.updated',
      resourceType: 'verification',
      resourceId: verificationId,
      details: { updates: input },
    });

    return verification;
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats(organizationId?: string) {
    const match: any = {};
    if (organizationId) match.organizationId = new mongoose.Types.ObjectId(organizationId);

    const [statusCounts, typeCounts, recentVerifications, totalCounts] =
      await Promise.all([
        Verification.aggregate([
          { $match: match },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Verification.aggregate([
          { $match: match },
          { $group: { _id: '$verificationType', count: { $sum: 1 } } },
        ]),
        Verification.find(match)
          .populate('candidateId', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(5),
        Verification.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              pending: {
                $sum: {
                  $cond: [
                    { $in: ['$status', ['pending', 'assigned', 'in_progress']] },
                    1,
                    0,
                  ],
                },
              },
              failed: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
              needsReview: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'manual_review'] }, 1, 0],
                },
              },
            },
          },
        ]),
      ]);

    const counts = totalCounts[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      needsReview: 0,
    };

    return {
      overview: counts,
      byStatus: statusCounts,
      byType: typeCounts,
      recentVerifications,
    };
  }
}

export const verificationService = new VerificationService();
