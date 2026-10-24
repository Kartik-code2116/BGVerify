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
    authNotes: 'Official Government of India academic depository holding 2.5B+ accredited certificates.',
  },
  {
    name: 'Savitribai Phule Pune University (SPPU Registrar Portal)',
    category: 'education',
    loginUrl: 'https://unipune.ac.in/portal/login',
    searchUrl: 'https://unipune.ac.in/electronic-verify',
    username: 'sppu_hr_verify_2024',
    password: 'MockSPPUSecret#892',
    email: 'university.checks@bgverify-corp.com',
    authNotes: 'Online degree verification system for SPPU affiliated colleges and autonomous institutes.',
  },
  {
    name: 'Employees’ Provident Fund Organisation (EPFO Gateway)',
    category: 'employment',
    loginUrl: 'https://unifiedportal-emp.epfindia.gov.in/epfo/',
    searchUrl: 'https://unifiedportal-mem.epfindia.gov.in/service-history',
    username: 'MH_PUN_0089218_000',
    password: 'MockEPFOPassword#2026',
    email: 'compliance.epfo@bgverify-corp.com',
    authNotes: 'Universal Account Number (UAN) passbook and authenticated EPF monthly contribution records.',
  },
  {
    name: 'Ministry of Corporate Affairs (MCA21 Registry)',
    category: 'employment',
    loginUrl: 'https://www.mca.gov.in/mcafoportal/login.html',
    searchUrl: 'https://mca.gov.in/mcafoportal/verify-director',
    username: 'mca_corp_agent_91',
    password: 'MockMCAPassword#123',
    email: 'corporate.legal@bgverify-corp.com',
    authNotes: 'MCA company registration, signatory details, and director records ledger.',
  },
  {
    name: 'UIDAI Aadhaar & NSDL PAN Verification Gate',
    category: 'identity',
    loginUrl: 'https://myaadhaar.uidai.gov.in/login',
    searchUrl: 'https://myaadhaar.uidai.gov.in/verify-identity',
    username: 'uidai_aua_kua_8921',
    password: 'MockUIDAISecret#99',
    email: 'identity.gateway@bgverify-corp.com',
    authNotes: 'Offline Aadhaar XML and PAN cryptographic signature verification service.',
  },
  {
    name: 'eCourts Services India (National Case Status)',
    category: 'criminal',
    loginUrl: 'https://services.ecourts.gov.in/ecourtindia_v6/login',
    searchUrl: 'https://services.ecourts.gov.in/case-search',
    username: 'adv_litigation_check_44',
    password: 'MockCourtsPass#89',
    email: 'court.records@bgverify-corp.com',
    authNotes: 'Pan-India district and high courts judicial case history and civil/criminal litigation records.',
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
      await portal.save();

      res.status(200).json({
        success: true,
        message: `Playwright bot connected & logged into "${portal.name}" successfully!`,
        data: {
          portal,
          screenshotBase64: result.screenshotBase64,
          logs: result.logs,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;
