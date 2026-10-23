import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { Organization } from './organization.model';
import { User } from '../users/user.model';
import { Wallet } from '../wallet/wallet.model';
import { Candidate } from '../candidates/candidate.model';
import { Verification } from '../verifications/verification.model';
import { NotFoundError } from '../../utils/errors';

const router = Router();

router.use(authenticate);

// GET /api/v1/organizations — list organizations (admin only)
router.get(
  '/',
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const search = req.query.search as string;
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const [organizations, total] = await Promise.all([
        Organization.find(query)
          .populate('ownerId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Organization.countDocuments(query),
      ]);

      // Attach wallet balances
      const orgsWithWallets = await Promise.all(
        organizations.map(async (org) => {
          const wallet = await Wallet.findOne({ organizationId: org._id });
          return {
            ...org.toJSON(),
            wallet: wallet
              ? { balance: wallet.balance, totalPurchased: wallet.totalPurchased }
              : null,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          organizations: orgsWithWallets,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/organizations/:id — get organization details
router.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (
        req.user!.role !== 'admin' &&
        req.user!.organizationId !== req.params.id
      ) {
        throw new NotFoundError('Organization not found');
      }

      const organization = await Organization.findById(req.params.id).populate(
        'ownerId',
        'firstName lastName email'
      );
      if (!organization) throw new NotFoundError('Organization not found');

      const [wallet, memberCount, candidateCount, verificationCount] =
        await Promise.all([
          Wallet.findOne({ organizationId: organization._id }),
          User.countDocuments({ organizationId: organization._id }),
          Candidate.countDocuments({ organizationId: organization._id }),
          Verification.countDocuments({ organizationId: organization._id }),
        ]);

      res.status(200).json({
        success: true,
        data: {
          organization,
          wallet: wallet
            ? {
                balance: wallet.balance,
                totalPurchased: wallet.totalPurchased,
                totalSpent: wallet.totalSpent,
              }
            : null,
          stats: {
            members: memberCount,
            candidates: candidateCount,
            verifications: verificationCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/organizations/admin/stats — admin platform stats
router.get(
  '/admin/stats',
  authorize('admin'),
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const [orgCount, userCount, candidateCount, verificationCount, totalBGCoins] =
        await Promise.all([
          Organization.countDocuments(),
          User.countDocuments(),
          Candidate.countDocuments(),
          Verification.countDocuments(),
          Wallet.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPurchased' } } },
          ]),
        ]);

      res.status(200).json({
        success: true,
        data: {
          organizations: orgCount,
          users: userCount,
          candidates: candidateCount,
          verifications: verificationCount,
          totalBGCoinsSold: totalBGCoins[0]?.total || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
