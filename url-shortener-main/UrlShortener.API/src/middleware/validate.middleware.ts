import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
};