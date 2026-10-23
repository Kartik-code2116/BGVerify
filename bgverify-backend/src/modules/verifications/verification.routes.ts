import { Router } from 'express';
import { verificationController } from './verification.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createVerificationSchema, updateVerificationSchema } from './verification.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/verifications/stats — dashboard stats
router.get('/stats', verificationController.getDashboardStats);

// POST /api/v1/verifications — create verification request
router.post(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(createVerificationSchema),
  verificationController.create
);

// GET /api/v1/verifications — list verifications
router.get('/', verificationController.list);

// GET /api/v1/verifications/:id — get single verification
router.get('/:id', verificationController.getById);

// PATCH /api/v1/verifications/:id — update verification
router.patch(
  '/:id',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(updateVerificationSchema),
  verificationController.update
);

export default router;
