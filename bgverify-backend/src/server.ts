import app from './app';
import config from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

// Fix Windows terminal encoding so Unicode box-drawing characters render correctly
if (process.platform === 'win32') {
  try { process.stdout.write('\u001b%G'); } catch (_) {}
  try { process.stderr.write('\u001b%G'); } catch (_) {}
}

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║   🔍 BGVerify.ai API Server                            ║
  ║                                                        ║
  ║   Environment : ${config.env.padEnd(32)}       ║
  ║   Port        : ${String(config.port).padEnd(32)}       ║
  ║   API Prefix  : ${config.apiPrefix.padEnd(32)}       ║
  ║   Health      : http://localhost:${config.port}/health           ║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
