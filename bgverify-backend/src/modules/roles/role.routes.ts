import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { JobRole } from './role.model';
import { Candidate } from '../candidates/candidate.model';
import { NotFoundError } from '../../utils/errors';

const router = Router();

router.use(authenticate);

const createRoleSchema = z.object({
  title: z.string().min(2),
  sector: z.string().min(2),
  department: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  openPositions: z.number().min(1).default(1),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).default('mid'),
  locationType: z.enum(['remote', 'hybrid', 'onsite']).default('hybrid'),
  location: z.string().optional(),
  requiredChecks: z.array(z.string()).default(['education', 'employment', 'identity']),
  targetJoiningDate: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed']).default('active'),
  description: z.string().optional(),
});

// GET /api/v1/roles/summary — Aggregated sector & urgency analytics
router.get(
  '/summary',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgFilter = req.user!.role === 'admin' ? {} : { organizationId: req.user!.organizationId };

      const [roles, candidates] = await Promise.all([
        JobRole.find(orgFilter).lean(),
        Candidate.find(orgFilter).lean(),
      ]);

      const totalRoles = roles.length;
      const activeRoles = roles.filter((r) => r.status === 'active').length;
      const urgentRoles = roles.filter((r) => r.urgency === 'urgent').length;
      const totalOpenings = roles.reduce((acc, r) => acc + (r.openPositions || 1), 0);
      const totalFilled = roles.reduce((acc, r) => acc + (r.filledPositions || 0), 0);

      // Group by sector
      const sectorMap: Record<string, { sector: string; roleCount: number; openings: number; candidatesCount: number }> = {};
      roles.forEach((r) => {
        const sec = r.sector || 'General';
        if (!sectorMap[sec]) {
          sectorMap[sec] = { sector: sec, roleCount: 0, openings: 0, candidatesCount: 0 };
        }
        sectorMap[sec].roleCount += 1;
        sectorMap[sec].openings += r.openPositions || 1;
      });

      // Count candidates by sector
      candidates.forEach((c) => {
        const sec = c.sector || 'General';
        if (sectorMap[sec]) {
          sectorMap[sec].candidatesCount += 1;
        }
      });

      const urgentCandidatesCount = candidates.filter((c) => c.urgency === 'urgent').length;
      const clearedCandidatesCount = candidates.filter(
        (c) => c.hiringStage === 'cleared' || c.hiringStage === 'hired'
      ).length;

      res.status(200).json({
        success: true,
        data: {
          totalRoles,
          activeRoles,
          urgentRoles,
          totalOpenings,
          totalFilled,
          urgentCandidatesCount,
          clearedCandidatesCount,
          sectors: Object.values(sectorMap),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/roles — List roles with candidate count enrichment
router.get(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: any = {};
      if (req.user!.role !== 'admin') {
        query.organizationId = req.user!.organizationId;
      }

      if (req.query.sector && req.query.sector !== 'all') {
        query.sector = req.query.sector;
      }
      if (req.query.urgency && req.query.urgency !== 'all') {
        query.urgency = req.query.urgency;
      }
      if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status;
      }
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { sector: { $regex: req.query.search, $options: 'i' } },
          { department: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      const roles = await JobRole.find(query).sort({ urgency: -1, createdAt: -1 }).lean();

      // Enrich with candidate counts for each role
      const enrichedRoles = await Promise.all(
        roles.map(async (role) => {
          const candidateStats = await Candidate.aggregate([
            {
              $match: {
                $or: [
                  { jobRoleId: role._id },
                  { targetRole: { $regex: new RegExp(`^${role.title}$`, 'i') } },
                ],
              },
            },
            {
              $group: {
                _id: '$hiringStage',
                count: { $sum: 1 },
              },
            },
          ]);

          let totalCandidates = 0;
          let clearedCandidates = 0;
          let hiredCandidates = 0;

          candidateStats.forEach((stat) => {
            totalCandidates += stat.count;
            if (stat._id === 'cleared') clearedCandidates += stat.count;
            if (stat._id === 'hired') hiredCandidates += stat.count;
          });

          return {
            ...role,
            totalCandidates,
            clearedCandidates,
            hiredCandidates: Math.max(role.filledPositions || 0, hiredCandidates),
          };
        })
      );

      res.status(200).json({
        success: true,
        data: enrichedRoles,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/roles — Create new hiring role
router.post(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(createRoleSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = new JobRole({
        ...req.body,
        organizationId: req.user!.organizationId,
        createdBy: req.user!.id,
      });

      await role.save();

      res.status(201).json({
        success: true,
        message: 'Hiring role created successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/roles/:id — Get single role + candidate pipeline
router.get(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = await JobRole.findById(req.params.id);
      if (!role) {
        throw new NotFoundError('Job role not found');
      }

      const candidates = await Candidate.find({
        $or: [{ jobRoleId: role._id }, { targetRole: role.title }],
      }).lean();

      res.status(200).json({
        success: true,
        data: {
          role,
          candidates,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/roles/:id — Update role or urgency
router.patch(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!role) {
        throw new NotFoundError('Job role not found');
      }

      res.status(200).json({
        success: true,
        message: 'Job role updated successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/roles/:id — Delete role
router.delete(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = await JobRole.findByIdAndDelete(req.params.id);
      if (!role) {
        throw new NotFoundError('Job role not found');
      }

      res.status(200).json({
        success: true,
        message: 'Job role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
