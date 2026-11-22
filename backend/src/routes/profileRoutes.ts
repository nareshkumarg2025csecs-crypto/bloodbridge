import { Router, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';

export const profileRouter = Router();

// GET /api/v1/profile
profileRouter.get('/', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const inst = user.institutionId ? db.institutions.get(user.institutionId) : null;

  res.status(200).json({
    id: user.id,
    name: inst ? inst.name : user.fullName,
    email: user.email,
    phone: inst ? inst.emergencyContactPhone : user.phoneNumber,
    address: inst ? `${inst.addressLine1}, ${inst.locality}, ${inst.city} - ${inst.pincode}` : 'Chennai, Tamil Nadu',
    license: inst ? inst.registrationLicenseNumber : 'TN/CHN/2021/BL/0892',
    avatarLetter: inst ? inst.name.charAt(0) : 'R',
    isVerified: inst ? inst.isVerified : true,
  });
});

// PUT /api/v1/profile
profileRouter.put('/', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, address } = req.body;
  const user = req.user!;

  if (email) user.email = email;
  if (name && user.institutionId) {
    const inst = db.institutions.get(user.institutionId);
    if (inst) {
      inst.name = name;
      if (phone) inst.emergencyContactPhone = phone;
      if (address) inst.addressLine1 = address;
    }
  }

  res.status(200).json({
    message: 'Profile settings updated successfully',
    user: {
      name: name || user.fullName,
      email: user.email,
    },
  });
});

// PUT /api/v1/profile/password
profileRouter.put('/password', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ title: 'Validation Error', detail: 'Both current and new password required' });
    return;
  }

  res.status(200).json({ message: 'Password updated successfully' });
});
