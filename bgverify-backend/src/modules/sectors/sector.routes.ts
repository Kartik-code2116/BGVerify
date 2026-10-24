import { Router, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { Sector } from './sector.model';
import { JobRole } from '../roles/role.model';
import { Candidate } from '../candidates/candidate.model';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const router = Router();

router.use(authenticate);

const DEFAULT_SECTORS = [
  { name: 'Technology & IT', color: 'cyan', description: 'Software engineering, AI/ML, cloud infrastructure, and cybersecurity roles.', defaultChecks: ['education', 'employment', 'identity'] },
  { name: 'Financial Services & BFSI', color: 'emerald', description: 'Banking, investment, audit, risk analytics, and accounting roles.', defaultChecks: ['education', 'employment', 'identity', 'criminal_record', 'credit_history'] },
  { name: 'Healthcare & Pharmaceuticals', color: 'rose', description: 'Clinical staff, laboratory researchers, physicians, and biomedical engineering.', defaultChecks: ['education', 'identity', 'employment'] },
  { name: 'Logistics & Supply Chain', color: 'amber', description: 'Fleet operators, warehouse supervisors, procurement, and dispatch leads.', defaultChecks: ['identity', 'criminal_record', 'driving_license'] },
  { name: 'Sales & Marketing', color: 'indigo', description: 'Enterprise sales, account management, brand growth, and digital marketing.', defaultChecks: ['employment', 'education', 'identity'] },
  { name: 'Human Resources', color: 'purple', description: 'Talent acquisition, compensation & benefits, and HR operations.', defaultChecks: ['employment', 'education', 'identity'] },
  { name: 'Operations & Administration', color: 'blue', description: 'Facilities management, back-office operations, and vendor coordinators.', defaultChecks: ['identity', 'employment', 'criminal_record'] },
];

const sectorSchema = z.object({
  name: z.string().min(2),
  color: z.string().min(2).default('cyan'),
  description: z.string().optional(),
  defaultChecks: z.array(z.string()).default(['education', 'employment', 'identity']),
});

// GET /api/v1/sectors — List sectors for company (auto-provision defaults if empty)
router.get(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;

      let sectors = await Sector.find({ organizationId: orgId }).sort({ createdAt: 1 });

      // Auto-provision initial defaults if none exist for this organization
      if (sectors.length === 0 && orgId) {
        const docs = DEFAULT_SECTORS.map((s) => ({
          ...s,
          organizationId: new mongoose.Types.ObjectId(String(orgId)),
          createdBy: new mongoose.Types.ObjectId(String(req.user!.id)),
        }));
        await Sector.insertMany(docs);
        sectors = await Sector.find({ organizationId: orgId }).sort({ createdAt: 1 });
      }

      // Enrich with role count and candidate count
      const enriched = await Promise.all(
        sectors.map(async (sec) => {
          const [roleCount, candidateCount] = await Promise.all([
            JobRole.countDocuments({ organizationId: orgId, sector: sec.name }),
            Candidate.countDocuments({ organizationId: orgId, sector: sec.name }),
          ]);
          return {
            ...sec.toJSON(),
            roleCount,
            candidateCount,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: enriched,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/sectors — Create a custom sector
router.post(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(sectorSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;

      const existing = await Sector.findOne({
        organizationId: orgId,
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
      });
      if (existing) {
        throw new BadRequestError(`Sector "${req.body.name}" already exists in your organization`);
      }

      const sector = new Sector({
        ...req.body,
        organizationId: orgId,
        createdBy: req.user!.id,
      });
      await sector.save();

      res.status(201).json({
        success: true,
        message: `Sector "${sector.name}" created successfully`,
        data: sector,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/sectors/:id — Edit or rename sector (and cascade to roles/candidates)
router.patch(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      const sector = await Sector.findOne({ _id: req.params.id, organizationId: orgId });
      if (!sector) throw new NotFoundError('Sector not found');

      const oldName = sector.name;
      const newName = req.body.name ? req.body.name.trim() : oldName;

      // Check if new name collides with another sector
      if (newName !== oldName) {
        const duplicate = await Sector.findOne({
          _id: { $ne: sector._id },
          organizationId: orgId,
          name: { $regex: new RegExp(`^${newName}$`, 'i') },
        });
        if (duplicate) {
          throw new BadRequestError(`Another sector named "${newName}" already exists`);
        }
      }

      sector.name = newName;
      if (req.body.color) sector.color = req.body.color;
      if (req.body.description !== undefined) sector.description = req.body.description;
      if (req.body.defaultChecks) sector.defaultChecks = req.body.defaultChecks;
      await sector.save();

      // Cascade rename across JobRoles and Candidates if name changed
      if (newName !== oldName) {
        await Promise.all([
          JobRole.updateMany({ organizationId: orgId, sector: oldName }, { sector: newName }),
          Candidate.updateMany({ organizationId: orgId, sector: oldName }, { sector: newName }),
        ]);
      }

      res.status(200).json({
        success: true,
        message: `Sector "${sector.name}" updated successfully`,
        data: sector,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/sectors/:id — Delete a sector
router.delete(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      const sector = await Sector.findOne({ _id: req.params.id, organizationId: orgId });
      if (!sector) throw new NotFoundError('Sector not found');

      // Check if sector is currently used by any active roles or candidates
      const [rolesInUse, candidatesInUse] = await Promise.all([
        JobRole.countDocuments({ organizationId: orgId, sector: sector.name }),
        Candidate.countDocuments({ organizationId: orgId, sector: sector.name }),
      ]);

      if (rolesInUse > 0 || candidatesInUse > 0) {
        throw new BadRequestError(
          `Cannot delete sector "${sector.name}" because it is currently assigned to ${rolesInUse} roles and ${candidatesInUse} candidates. Reassign them first or edit the sector name instead.`
        );
      }

      await Sector.findByIdAndDelete(sector._id);

      res.status(200).json({
        success: true,
        message: `Sector "${sector.name}" deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
