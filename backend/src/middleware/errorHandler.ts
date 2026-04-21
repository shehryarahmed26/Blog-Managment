import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  const anyErr = err as { name?: string; message?: string; code?: number };
  if (anyErr?.name === 'CastError') {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  if (anyErr?.code === 11000) {
    res.status(409).json({ message: 'Duplicate value' });
    return;
  }
  console.error('[error]', err);
  res.status(500).json({ message: anyErr?.message || 'Internal server error' });
}
