import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/health', healthRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
