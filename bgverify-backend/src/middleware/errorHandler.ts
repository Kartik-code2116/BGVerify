import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  res.status(500).json({
    success: false,
    error: {
      message:
        config.env === 'development'
          ? err.message
          : 'An unexpected error occurred',
      statusCode: 500,
    },
  });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
