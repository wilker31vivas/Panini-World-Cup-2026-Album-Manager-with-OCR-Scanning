import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${status}] ${message}`);
  res.status(status).json({ error: message });
};
