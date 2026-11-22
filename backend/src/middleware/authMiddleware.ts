import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { db } from '../database/repository';
import { User, UserRole } from '../types/models';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      type: 'https://bloodbridge.in/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or malformed Authorization header. Bearer token required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
    const user = db.users.get(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        type: 'https://bloodbridge.in/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User session is invalid or user account has been deactivated.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      type: 'https://bloodbridge.in/errors/invalid-token',
      title: 'Invalid Token',
      status: 401,
      detail: 'Access token has expired or signature verification failed.',
    });
  }
};

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        type: 'https://bloodbridge.in/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required before evaluating roles.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        type: 'https://bloodbridge.in/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `Access denied. Role '${req.user.role}' lacks necessary permissions. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
