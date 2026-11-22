import { Router, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';

export const alertRouter = Router();

// GET /api/v1/alerts
alertRouter.get('/', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const alerts = [
    {
      id: 'alt-1',
      units: 2,
      bloodType: 'O+',
      days: 2,
      status: 'Urgent',
      tintBg: '#FDECEC',
      borderColor: '#F9D6D7',
      accentBorder: '#E5484D',
      badgeBg: '#FBD5D6',
      badgeColor: '#E5484D',
      dropColor: '#E5484D',
      title: 'Expiry Alert',
      description: '2 units of O+ will expire in 2 days',
    },
    {
      id: 'alt-2',
      units: 1,
      bloodType: 'B-',
      days: 4,
      status: 'Soon',
      tintBg: '#FFFBEB',
      borderColor: '#FDE68A',
      accentBorder: '#F59E0B',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      dropColor: '#F59E0B',
      title: 'Shelf-Life Warning',
      description: '1 unit of B- will expire in 4 days',
    },
  ];

  res.status(200).json(alerts);
});

// POST /api/v1/alerts/redistribute
alertRouter.post('/redistribute', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const { alertId } = req.body;

  // Broadcast to partner hospitals in Chennai cluster
  res.status(200).json({
    success: true,
    alertId,
    notifiedPartnersCount: db.institutions.size,
    message: `Redistribution broadcast sent to ${db.institutions.size} partner blood banks across Chennai!`,
  });
});
