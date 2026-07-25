import { env } from './config/env.js';
import app from './app.js';

const HOST = '0.0.0.0';

const server = app.listen(env.port, HOST, () => {
  console.log(`[TruthForge-AI Backend] Server running on ${HOST}:${env.port}`);
  console.log(`[TruthForge-AI Backend] Environment: ${env.nodeEnv}`);
  console.log(`[TruthForge-AI Backend] Health Check: http://localhost:${env.port}/api/v1/health`);
});

const gracefulShutdown = (signal) => {
  console.log(`[TruthForge-AI Backend] ${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('[TruthForge-AI Backend] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
