import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { Candidate } from './candidate.model';
import { User } from '../users/user.model';
import { NotFoundError } from '../../utils/errors';

const router = Router();

const createCandidateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string().optional(),
        startYear: z.number().optional(),
        endYear: z.number().optional(),
        grade: z.string().optional(),
      })
    )
    .optional(),
  employment: z
    .array(
      z.object({
        company: z.string(),
        designation: z.string(),
        department: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        employeeId: z.string().optional(),
        ctc: z.string().optional(),
        reportingManager: z.string().optional(),
      })
    )
    .optional(),
});

router.use(authenticate);

// POST /api/v1/candidates — create candidate
router.post(
  '/',
  authorize('admin', 'org_owner', 'hr_admin', 'hr_executive'),
  validate(createCandidateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Create candidate user account
      const existingUser = await User.findOne({ email: req.body.email });
      let candidateUserId;

      if (!existingUser) {
        const candidateUser = new User({
          email: req.body.email,
          password: 'Candidate@123', // Default password, should be changed
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          role: 'candidate',
          phone: req.body.phone,
        });
        await candidateUser.save();
        candidateUserId = candidateUser._id;
      } else {
        candidateUserId = existingUser._id;
      }

      const candidate = new Candidate({
        ...req.body,
        organizationId: req.user!.organizationId,
        submittedBy: req.user!.id,
        userId: candidateUserId,
        status: 'pending_consent',
      });
      await candidate.save();

      res.status(201).json({
        success: true,
        message: 'Candidate created successfully',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/candidates — list candidates
router.get(
  '/',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: any = {};

      if (req.user!.role === 'candidate') {
        query.userId = req.user!.id;
      } else if (req.user!.role !== 'admin') {
        query.organizationId = req.user!.organizationId;
      }

      if (req.query.status) query.status = req.query.status;
      if (req.query.search) {
        query.$or = [
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [candidates, total] = await Promise.all([
        Candidate.find(query)
          .populate('submittedBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Candidate.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          candidates,
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

// GET /api/v1/candidates/:id
router.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: any = { _id: req.params.id };
      if (req.user!.role === 'candidate') {
        query.userId = req.user!.id;
      } else if (req.user!.role !== 'admin') {
        query.organizationId = req.user!.organizationId;
      }

      const candidate = await Candidate.findOne(query)
        .populate('submittedBy', 'firstName lastName email')
        .populate('organizationId', 'name');

      if (!candidate) throw new NotFoundError('Candidate not found');

      res.status(200).json({ success: true, data: candidate });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/candidates/:id/consent — candidate gives consent
router.patch(
  '/:id/consent',
  authorize('candidate'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const candidate = await Candidate.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });
      if (!candidate) throw new NotFoundError('Candidate not found');

      candidate.consentGiven = true;
      candidate.consentDate = new Date();
      candidate.status = 'active';
      await candidate.save();

      res.status(200).json({
        success: true,
        message: 'Consent recorded successfully',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
