import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { verificationService } from './verification.service';

class VerificationController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const verification = await verificationService.create(
        req.body,
        req.user!.id,
        req.user!.organizationId!
      );
      res.status(201).json({
        success: true,
        message: 'Verification request created successfully',
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId =
        req.user!.role === 'admin' ? null : req.user!.organizationId!;
      const result = await verificationService.list(organizationId, {
        status: req.query.status as string,
        verificationType: req.query.verificationType as string,
        candidateId: req.query.candidateId as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId =
        req.user!.role === 'admin' ? undefined : req.user!.organizationId!;
      const verification = await verificationService.getById(
        req.params.id,
        organizationId
      );
      res.status(200).json({ success: true, data: verification });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const verification = await verificationService.update(
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role,
        req.user!.organizationId
      );
      res.status(200).json({
        success: true,
        message: 'Verification updated successfully',
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId =
        req.user!.role === 'admin' ? undefined : req.user!.organizationId!;
      const stats = await verificationService.getDashboardStats(organizationId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async rerunBot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user!.role === 'admin' ? null : req.user!.organizationId!;
      const verification = await verificationService.rerunBot(
        req.params.id,
        organizationId,
        {
          headless: req.body.headless !== undefined ? Boolean(req.body.headless) : true,
          simulateDiscrepancy: req.body.simulateDiscrepancy,
        }
      );
      res.status(200).json({
        success: true,
        message: 'Playwright automation bot completed successfully!',
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
