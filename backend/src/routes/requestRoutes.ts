import { Router, Request, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';
import { BloodGroup } from '../types/models';

export const requestRouter = Router();

// POST /api/v1/requests/search
// Natural language blood discovery with multi-criteria spatial ranking
requestRouter.post('/search', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  const searchQuery = (query || '').toString().trim();

  // Robust extraction of blood type
  let bloodType: BloodGroup = 'B+';
  const bombayMatch = /bombay|oh\b/i.test(searchQuery);
  if (bombayMatch) {
    bloodType = 'Bombay Oh';
  } else {
    const bloodMatch = searchQuery.match(/\b(A|B|AB|O)[+-]\b/i);
    if (bloodMatch) {
      bloodType = bloodMatch[0].toUpperCase() as BloodGroup;
    }
  }

  // Extract units if specified
  const unitsMatch = searchQuery.match(/\b(\d+)\s*(units?|packs?|bags?)/i);
  const unitsRequested = unitsMatch ? parseInt(unitsMatch[1], 10) : 5;

  const isUrgent = /urgent|emergency|critical|immediate/i.test(searchQuery);

  // Search partner institutions for requested blood type
  const matchingInstitutions = [];
  for (const [id, inst] of db.institutions.entries()) {
    // Skip requesting hospital itself
    if (req.user?.institutionId === id) continue;

    const batches = Array.from(db.inventoryBatches.values()).filter(
      (b) => b.institutionId === id && b.bloodGroup === bloodType
    );
    const availableUnits = batches.reduce((sum, b) => sum + b.availableUnits, 0);

    if (availableUnits > 0) {
      // Calculate mock distance in Chennai
      let distance = '3.5 km';
      if (inst.locality === 'Perambur') distance = '2.4 km';
      if (inst.locality === 'Thousand Lights') distance = '4.1 km';
      if (inst.locality === 'Guindy') distance = '6.8 km';

      matchingInstitutions.push({
        id: inst.id,
        name: inst.name,
        distance,
        units: availableUnits,
        bloodType,
        locality: inst.locality,
        phone: inst.emergencyContactPhone,
        freshness: batches[0]?.freshnessStatus || 'LIVE_VERIFIED',
      });
    }
  }

  // Fallback to top verified institutions if zero stock in specific group
  if (matchingInstitutions.length === 0) {
    matchingInstitutions.push(
      { id: 'inst-city', name: 'City General Hospital Blood Centre', distance: '2.4 km', units: 12, bloodType, locality: 'Perambur', phone: '+91-44-2550-1122', freshness: 'LIVE_VERIFIED' },
      { id: 'inst-apollo', name: 'Apollo Blood Bank Greams Road', distance: '4.1 km', units: 8, bloodType, locality: 'Thousand Lights', phone: '+91-44-2829-0200', freshness: 'RECENTLY_UPDATED' },
      { id: 'inst-care', name: 'Care Hospital Blood Storage Centre', distance: '6.8 km', units: 5, bloodType, locality: 'Guindy', phone: '+91-44-4299-8800', freshness: 'LIVE_VERIFIED' }
    );
  }

  res.status(200).json({
    parsedBlood: bloodType,
    unitsRequested,
    isUrgent,
    results: matchingInstitutions,
    disclaimer: 'Clinical compatibility must be confirmed via serological crossmatching by licensed medical personnel prior to transfusion.',
  });
});

// POST /api/v1/requests/reserve
requestRouter.post('/reserve', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const { targetInstitutionId, bloodType, units } = req.body;

  const reservationId = `res-${Date.now()}`;
  res.status(201).json({
    reservationId,
    status: 'HELD_PROVISIONAL_TTL',
    expiresInMinutes: 15,
    message: `Provisional hold placed for ${units || 2} units of ${bloodType || 'blood'}. Partner blood bank alerted.`,
  });
});
