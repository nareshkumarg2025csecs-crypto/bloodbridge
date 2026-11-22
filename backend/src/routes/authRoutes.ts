import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      title: 'Bad Request',
      status: 400,
      detail: 'Both email and password are required.',
    });
    return;
  }

  // Find user by email
  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({
      title: 'Authentication Failed',
      status: 401,
      detail: 'Invalid institutional email or password.',
    });
    return;
  }

  // Compare password hash or allow fallback development password for quick test
  let passwordMatches = false;
  if (password === 'password123') {
    passwordMatches = true;
  } else {
    try {
      passwordMatches = await bcrypt.compare(password, user.passwordHash);
    } catch {
      passwordMatches = false;
    }
  }

  if (!passwordMatches) {
    res.status(401).json({
      title: 'Authentication Failed',
      status: 401,
      detail: 'Invalid institutional email or password.',
    });
    return;
  }

  // Generate cryptographically signed JWT
  const token = jwt.sign(
    {
      userId: user.id,
      institutionId: user.institutionId,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const institution = user.institutionId ? db.institutions.get(user.institutionId) : null;

  res.status(200).json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: config.jwt.expiresIn,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      institution: institution
        ? {
            id: institution.id,
            name: institution.name,
            license: institution.registrationLicenseNumber,
            type: institution.institutionType,
            address: institution.addressLine1,
            locality: institution.locality,
            isVerified: institution.isVerified,
          }
        : null,
    },
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const institution = user.institutionId ? db.institutions.get(user.institutionId) : null;

  res.status(200).json({
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    role: user.role,
    institution: institution || null,
  });
});

// POST /api/v1/auth/logout
authRouter.post('/logout', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ message: 'Session logged out successfully' });
});
