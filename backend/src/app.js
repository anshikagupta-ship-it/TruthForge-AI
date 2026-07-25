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
app.use(express.urlencoded({ extended: true }));

// Core API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/queries', queriesRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/claims', claimsRoutes);
app.use('/api/v1/sources', sourcesRoutes);
app.use('/api/v1/pipeline', pipelineRoutes);

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
