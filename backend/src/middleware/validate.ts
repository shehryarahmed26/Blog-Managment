import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: Schema, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map((d) => ({ path: d.path.join('.'), message: d.message })),
      });
      return;
    }
    // replace with sanitized value
    (req as unknown as Record<Source, unknown>)[source] = value;
    next();
  };
