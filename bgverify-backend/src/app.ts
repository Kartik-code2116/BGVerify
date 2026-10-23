import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import verificationRoutes from './modules/verifications/verification.routes';
import candidateRoutes from './modules/candidates/candidate.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import organizationRoutes from './modules/organizations/organization.routes';
import auditRoutes from './modules/audit/audit.routes';
import roleRoutes from './modules/roles/role.routes';

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ───────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
});
app.use(limiter);

// ─── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'BGVerify API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/verifications`, verificationRoutes);
app.use(`${config.apiPrefix}/candidates`, candidateRoutes);
app.use(`${config.apiPrefix}/wallet`, walletRoutes);
app.use(`${config.apiPrefix}/organizations`, organizationRoutes);
app.use(`${config.apiPrefix}/audit`, auditRoutes);
app.use(`${config.apiPrefix}/roles`, roleRoutes);

// ─── Error Handling ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
