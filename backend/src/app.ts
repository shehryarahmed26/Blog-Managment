import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler, notFound } from './middleware/errorHandler';

// Any http(s)://localhost:<port> or 127.0.0.1 origin is allowed in dev,
// plus any explicit origins listed in CORS_ORIGIN (comma-separated).
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function buildCorsOptions(): CorsOptions {
  const explicit =
    process.env.CORS_ORIGIN?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  return {
    origin: (origin, cb) => {
      // Allow non-browser clients (curl, Postman) that send no Origin.
      if (!origin) return cb(null, true);
      if (LOCALHOST_RE.test(origin)) return cb(null, true);
      if (explicit.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  };
}

export function createApp() {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/stats', statsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
