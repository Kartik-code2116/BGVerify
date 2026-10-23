import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../modules/users/user.model';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      organizationId?: string;
    };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId?.toString(),
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error('Authentication error:', error);
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};

/**
 * Ensure user belongs to the organization they're trying to access
 */
export const authorizeOrganization = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Admins can access any organization
  if (req.user.role === 'admin') {
    return next();
  }

  const orgId = req.params.organizationId || req.body.organizationId;
  if (orgId && req.user.organizationId !== orgId) {
    return next(
      new ForbiddenError('You do not have access to this organization')
    );
  }

  next();
};
