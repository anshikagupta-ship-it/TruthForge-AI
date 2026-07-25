import { env } from '../config/env.js';

export const getHealthStatus = (req, res) => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  return res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    environment: env.nodeEnv,
    version: '1.0.0',
  });
};
