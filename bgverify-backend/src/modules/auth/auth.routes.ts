import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/v1/auth/profile
router.get('/profile', authenticate, authController.getProfile);

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

export default router;
