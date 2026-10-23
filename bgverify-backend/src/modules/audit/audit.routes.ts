import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { AuditLog } from './audit.model';

const router = Router();

router.use(authenticate);

// GET /api/v1/audit — list audit logs
router.get(
  '/',
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: any = {};
      if (req.query.action) query.action = req.query.action;
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
      if (req.query.userId) query.userId = req.query.userId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('userId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
