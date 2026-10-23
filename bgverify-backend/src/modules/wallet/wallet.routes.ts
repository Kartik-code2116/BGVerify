import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { Wallet, WalletTransaction } from './wallet.model';
import { AuditLog } from '../audit/audit.model';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const router = Router();

router.use(authenticate);

// GET /api/v1/wallet — get wallet balance
router.get(
  '/',
  authorize('admin', 'org_owner', 'hr_admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let wallet;
      if (req.user!.role === 'admin' && req.query.organizationId) {
        wallet = await Wallet.findOne({
          organizationId: req.query.organizationId,
        });
      } else {
        wallet = await Wallet.findOne({
          organizationId: req.user!.organizationId,
        });
      }

      if (!wallet) throw new NotFoundError('Wallet not found');

      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/wallet/transactions — get transaction history
router.get(
  '/transactions',
  authorize('admin', 'org_owner', 'hr_admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: any = {};
      if (req.user!.role !== 'admin') {
        query.organizationId = req.user!.organizationId;
      } else if (req.query.organizationId) {
        query.organizationId = req.query.organizationId;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        WalletTransaction.find(query)
          .populate('performedBy', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        WalletTransaction.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/wallet/purchase — company buys BGCoins package
router.post(
  '/purchase',
  authorize('admin', 'org_owner', 'hr_admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { packageAmount } = req.body;
      const amount = parseInt(packageAmount);
      if (!amount || amount <= 0) {
        throw new BadRequestError('Invalid BGCoin package amount');
      }

      const orgId = req.user!.role === 'admin' && req.body.organizationId
        ? req.body.organizationId
        : req.user!.organizationId;

      if (!orgId) throw new BadRequestError('Organization ID is required');

      // Price mapping per documentation
      let priceInr = 0;
      if (amount === 100) priceInr = 9000;
      else if (amount === 500) priceInr = 42500;
      else if (amount === 1000) priceInr = 80000;
      else priceInr = amount * 90; // Default pro-rated ₹90/coin

      const wallet = await Wallet.findOneAndUpdate(
        { organizationId: orgId },
        {
          $inc: { balance: amount, totalPurchased: amount },
        },
        { new: true, upsert: true }
      );

      await WalletTransaction.create({
        walletId: wallet._id,
        organizationId: orgId,
        type: 'purchase',
        amount,
        balanceAfter: wallet.balance,
        description: `Purchased package of ${amount} BGCoins (₹${priceInr.toLocaleString('en-IN')})`,
        referenceType: 'purchase',
        performedBy: req.user!.id,
      });

      await AuditLog.create({
        userId: req.user!.id,
        organizationId: orgId,
        action: 'wallet.purchase',
        resourceType: 'wallet',
        resourceId: wallet._id.toString(),
        details: { amount, priceInr, newBalance: wallet.balance },
      });

      res.status(200).json({
        success: true,
        message: `Successfully purchased ${amount} BGCoins!`,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/wallet/topup — admin top up wallet
router.post(
  '/topup',
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId, amount, description } = req.body;
      if (!organizationId || !amount || amount <= 0) {
        throw new BadRequestError('Invalid top-up request');
      }

      const wallet = await Wallet.findOneAndUpdate(
        { organizationId },
        {
          $inc: { balance: amount, totalPurchased: amount },
        },
        { new: true }
      );

      if (!wallet) throw new NotFoundError('Wallet not found');

      await WalletTransaction.create({
        walletId: wallet._id,
        organizationId,
        type: 'purchase',
        amount,
        balanceAfter: wallet.balance,
        description: description || `Top up of ${amount} BGCoins`,
        referenceType: 'purchase',
        performedBy: req.user!.id,
      });

      await AuditLog.create({
        userId: req.user!.id,
        organizationId,
        action: 'wallet.topup',
        resourceType: 'wallet',
        resourceId: wallet._id.toString(),
        details: { amount, newBalance: wallet.balance },
      });

      res.status(200).json({
        success: true,
        message: `${amount} BGCoins added successfully`,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
