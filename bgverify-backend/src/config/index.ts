import dotenv from 'dotenv';
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bgverify',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  bgcoin: {
    pricing: {
      100: parseInt(process.env.BGCOIN_PRICE_100 || '9000', 10),
      500: parseInt(process.env.BGCOIN_PRICE_500 || '42500', 10),
      1000: parseInt(process.env.BGCOIN_PRICE_1000 || '80000', 10),
    },
  },
} as const;

export default config;
