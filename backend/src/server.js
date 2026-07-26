import { env } from './config/env.js';
import app from './app.js';

const HOST = '0.0.0.0';

const server = app.listen(env.port, HOST, () => {
  console.log(`[TruthForge-AI Backend] Server running on ${HOST}:${env.port}`);
  console.log(`[TruthForge-AI Backend] Environment: ${env.nodeEnv}`);
  console.log(`[TruthForge-AI Backend] Health Check: http://localhost:${env.port}/api/v1/health`);
});

// Render's load balancer expects a longer keep-alive than Node's 5s default.
// Without this, the LB can reset long-running connections (e.g. the pipeline
// endpoint) mid-request, which shows up client-side as a broken/HTML response
// instead of the JSON payload. headersTimeout must be greater than keepAliveTimeout.
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

const gracefulShutdown = (signal) => {
  console.log(`[TruthForge-AI Backend] ${signal} signal received. Closing HTTP server...`);
  server.close(() => {
    console.log('[TruthForge-AI Backend] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
