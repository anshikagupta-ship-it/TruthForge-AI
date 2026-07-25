import { logger } from '../utils/logger.js';

export const loggerMiddleware = (req, res, next) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    logger.logRequest(req.method, req.originalUrl || req.url, res.statusCode, duration);
  });

  next();
};
