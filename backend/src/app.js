import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import queriesRoutes from './modules/queries/routes/queries.routes.js';
import reportsRoutes from './modules/reports/routes/reports.routes.js';
import claimsRoutes from './modules/claims/routes/claims.routes.js';
import sourcesRoutes from './modules/sources/routes/sources.routes.js';
import pipelineRoutes from './modules/pipeline/routes/pipeline.routes.js';
import verificationRoutes from './modules/verification/routes/verification.routes.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));
app.use(loggerMiddleware);

app.use(express.json());
app.use(express.text({ type: ['text/plain', 'text/*'] }));
app.use(express.urlencoded({ extended: true }));

// Core API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/queries', queriesRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/sources', sourcesRoutes);
app.use('/api/v1/pipeline', pipelineRoutes);
app.use('/api/v1/verification', verificationRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Serve static frontend build if present
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
