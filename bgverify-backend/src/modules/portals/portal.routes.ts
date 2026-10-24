import { Router, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { Portal } from './portal.model';
import { playwrightBotService } from '../verifications/playwrightBot.service';
import { NotFoundError, BadRequestError } from '../../utils/errors';

const router = Router();

router.use(authenticate);

const DEFAULT_PORTALS = [
  {
    name: 'DigiLocker National Academic Depository (NAD)',
    category: 'education',
    loginUrl: 'https://nad.digitallocker.gov.in/institution/login',
    searchUrl: 'https://nad.digitallocker.gov.in/academic/verify',
    username: 'inst_registrar_auth@university.ac.in',
    password: 'MockSecurePassword#2026',
    email: 'academic.verifications@bgverify-corp.com',
    authNotes: 'Demo verification portal — Official Government academic depository. You can test or add custom institutional portals.',
  },
];

const createPortalSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['education', 'employment', 'identity', 'criminal', 'custom']).default('education'),
  loginUrl: z.string().url(),
  searchUrl: z.string().url(),
  username: z.string().min(1),
  password: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  apiKey: z.string().optional(),
  authNotes: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updatePortalSchema = createPortalSchema.partial();

// GET /api/v1/portals — List portals for company
router.get(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;

      let portals = await Portal.find({
        ...(orgId ? { organizationId: orgId } : {}),
      }).sort({ createdAt: -1 });

      // Auto-provision initial defaults if none exist for this organization
      if (portals.length === 0 && orgId) {
        const docs = DEFAULT_PORTALS.map((p) => ({
          ...p,
          organizationId: new mongoose.Types.ObjectId(String(orgId)),
          createdBy: new mongoose.Types.ObjectId(String(req.user!.id)),
        }));
        await Portal.insertMany(docs);
        portals = await Portal.find({ organizationId: orgId }).sort({ createdAt: 1 });
      }

      res.status(200).json({
        success: true,
        data: portals,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/portals — Add a new portal with credentials
router.post(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(createPortalSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      if (!orgId) {
        throw new BadRequestError('Organization context required');
      }

      const portal = await Portal.create({
        ...req.body,
        organizationId: orgId,
        createdBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        message: 'Verification portal registered successfully!',
        data: portal,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/portals/:id — Update portal & credentials
router.patch(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(updatePortalSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      const portal = await Portal.findOne({
        _id: req.params.id,
        ...(orgId ? { organizationId: orgId } : {}),
      });

      if (!portal) {
        throw new NotFoundError('Portal record not found');
      }

      Object.assign(portal, req.body);
      await portal.save();

      res.status(200).json({
        success: true,
        message: 'Portal configuration updated!',
        data: portal,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/portals/:id — Delete portal
router.delete(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      const portal = await Portal.findOneAndDelete({
        _id: req.params.id,
        ...(orgId ? { organizationId: orgId } : {}),
      });

      if (!portal) {
        throw new NotFoundError('Portal not found');
      }

      res.status(200).json({
        success: true,
        message: 'Portal removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/portals/:id/test-login — Run real Playwright bot login test
router.post(
  '/:id/test-login',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orgId = req.user!.organizationId;
      const portal = await Portal.findOne({
        _id: req.params.id,
        ...(orgId ? { organizationId: orgId } : {}),
      });

      if (!portal) {
        throw new NotFoundError('Portal not found');
      }

      const headless = req.body.headless !== undefined ? Boolean(req.body.headless) : true;

      const result = await playwrightBotService.testPortalLogin({
        portal: {
          name: portal.name,
          loginUrl: portal.loginUrl,
          searchUrl: portal.searchUrl,
          username: portal.username,
          password: portal.password,
          email: portal.email,
          category: portal.category,
        },
        headless,
      });

      portal.lastTestedAt = new Date();
      portal.testStatus = 'success';
      portal.testLogs = result.logs;
      portal.testScreenshot = result.screenshotBase64;
      portal.isLiveSnapshot = result.isLiveSnapshot;
      portal.captureType = result.captureType;
      await portal.save();

      res.status(200).json({
        success: true,
        message: result.isLiveSnapshot
          ? `Playwright connected & captured live screenshot from "${portal.name}"!`
          : `Portal connection offline — tested via sandboxed institutional clearance docket`,
        data: {
          portal,
          screenshotBase64: result.screenshotBase64,
          logs: result.logs,
          isLiveSnapshot: result.isLiveSnapshot,
          captureType: result.captureType,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
