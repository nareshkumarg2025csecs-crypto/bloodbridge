import { Router, Request, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';
import { wsGateway } from '../websocket/gateway';

export const networkRequestsRouter = Router();

// GET /api/v1/network-requests
// List active network requests published across the platform
networkRequestsRouter.get('/', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bloodGroup, urgency, status } = req.query;

    let sql = `
      SELECT r.*,
             (SELECT COUNT(*) FROM network_request_responses resp WHERE resp.request_id = r.id) as live_response_count
      FROM network_blood_requests r
      WHERE 1=1
    `;
    const params: any[] = [];

    if (bloodGroup && bloodGroup !== 'ALL') {
      sql += ` AND r.blood_group = ?`;
      params.push(bloodGroup);
    }
    if (urgency && urgency !== 'ALL') {
      sql += ` AND r.urgency_level = ?`;
      params.push(urgency);
    }
    if (status && status !== 'ALL') {
      sql += ` AND r.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rows]: any = await db.pool.query(sql, params);

    res.status(200).json({
      requests: rows.map((r: any) => ({
        id: r.id,
        requestCode: r.request_code,
        requesterUserId: r.requesting_user_id,
        requesterInstitutionId: r.requesting_institution_id,
        requesterInstitutionName: r.requesting_institution_name,
        requesterLocation: r.requesting_location,
        bloodGroup: r.blood_group,
        component: r.component,
        unitsRequested: r.units_requested,
        urgencyLevel: r.urgency_level,
        requiredBy: r.required_by,
        clinicalIndication: r.clinical_indication,
        visibilityScope: r.visibility_scope,
        status: r.status,
        eligibleInstitutionsNotified: r.eligible_institutions_notified,
        responsesCount: Number(r.live_response_count || r.responses_count || 0),
        createdAt: r.created_at,
        isNetworkWide: true,
      }))
    });
  } catch (err: any) {
    console.error('Error fetching network requests:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// POST /api/v1/network-requests/create
// Authorized Hospital Doctor / Hospital Officer publishes a network-wide blood request
networkRequestsRouter.post('/create', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const allowedRoles = ['HOSPITAL_OFFICER', 'HOSPITAL_MEDICAL_OFFICER', 'BLOOD_BANK_OFFICER', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        title: 'Permission Denied',
        detail: `Role ${user.role} is not authorized to publish network-wide blood requests.`
      });
      return;
    }

    const {
      bloodGroup,
      component,
      unitsRequested,
      urgencyLevel,
      requiredByHours,
      clinicalIndication,
      visibilityScope
    } = req.body;

    if (!bloodGroup || !unitsRequested) {
      res.status(400).json({ title: 'Bad Request', detail: 'Blood group and units requested are required.' });
      return;
    }

    const userNumeric = parseInt(user.id.replace(/\D/g, ''), 10) || 1;
    const instNumeric = user.institutionId ? parseInt(user.institutionId.replace(/\D/g, ''), 10) : 1;
    const inst = db.institutions.get(user.institutionId || `inst-${instNumeric}`);

    const requestCode = `NET-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const requiredBy = new Date(Date.now() + (parseInt(requiredByHours, 10) || 4) * 3600000);

    const [countVerified]: any = await db.pool.query(
      `SELECT COUNT(*) as c FROM institutions WHERE verification_status = 'VERIFIED'`
    );
    const eligibleCount = countVerified[0]?.c || 8;

    const [result]: any = await db.pool.query(`
      INSERT INTO network_blood_requests (
        request_code, requesting_user_id, requesting_institution_id,
        requesting_institution_name, requesting_location, blood_group,
        component, units_requested, urgency_level, required_by,
        clinical_indication, visibility_scope, status, eligible_institutions_notified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
    `, [
      requestCode,
      userNumeric,
      instNumeric,
      inst ? inst.name : 'Authorized Transfusion Centre',
      inst ? inst.locality : 'Chennai',
      bloodGroup,
      component || 'Packed Red Blood Cells (PRBC)',
      unitsRequested,
      urgencyLevel || 'CRITICAL_EMERGENCY',
      requiredBy,
      clinicalIndication || 'Acute clinical transfusion protocol required',
      visibilityScope || 'METRO_CHENNAI',
      eligibleCount
    ]);

    const createdId = result.insertId;

    // Broadcast in real-time to all connected WebSocket clients across the network
    const networkPayload = {
      type: 'NETWORK_BLOOD_REQUEST_PUBLISHED',
      requestId: createdId,
      requestCode,
      bloodGroup,
      component: component || 'Packed Red Blood Cells (PRBC)',
      unitsRequested,
      urgencyLevel: urgencyLevel || 'CRITICAL_EMERGENCY',
      requesterInstitutionName: inst ? inst.name : 'Authorized Transfusion Centre',
      requesterLocation: inst ? inst.locality : 'Chennai',
      eligibleInstitutionsNotified: eligibleCount,
      timestamp: new Date().toISOString()
    };

    wsGateway.broadcastEmergencyAlert(networkPayload);

    res.status(201).json({
      message: 'Network-wide blood request published successfully.',
      requestId: createdId,
      requestCode,
      eligibleInstitutionsNotified: eligibleCount
    });
  } catch (err: any) {
    console.error('Error creating network request:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// GET /api/v1/network-requests/:id/responses
// Get all verified hospital responses for a specific request
networkRequestsRouter.get('/:id/responses', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestId = req.params.id;
    const [responses]: any = await db.pool.query(
      `SELECT resp.*, k.public_key_base64 as responder_public_key
       FROM network_request_responses resp
       LEFT JOIN user_e2ee_public_keys k ON resp.responding_user_id = k.user_id
       WHERE resp.request_id = ?
       ORDER BY resp.created_at ASC`,
      [requestId]
    );

    res.status(200).json({ responses });
  } catch (err: any) {
    console.error('Error fetching responses:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// POST /api/v1/network-requests/:id/respond
// Responding hospital or blood bank offers availability
networkRequestsRouter.post('/:id/respond', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const requestId = req.params.id;

    const allowedRoles = ['BLOOD_BANK_OFFICER', 'HOSPITAL_OFFICER', 'HOSPITAL_MEDICAL_OFFICER', 'PATHOLOGIST_VERIFIER'];
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        title: 'Permission Denied',
        detail: `Role ${user.role} is not authorized to submit verified availability offers.`
      });
      return;
    }

    const { unitsOffered, componentOffered, estimatedPreparationMinutes, responseMessage } = req.body;

    const userNumeric = parseInt(user.id.replace(/\D/g, ''), 10) || 1;
    const instNumeric = user.institutionId ? parseInt(user.institutionId.replace(/\D/g, ''), 10) : 1;
    const inst = db.institutions.get(user.institutionId || `inst-${instNumeric}`);

    const [result]: any = await db.pool.query(`
      INSERT INTO network_request_responses (
        request_id, responding_user_id, responding_user_name, responding_user_role,
        responding_institution_id, responding_institution_name, units_offered,
        component_offered, estimated_preparation_time_minutes, response_message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
    `, [
      requestId,
      userNumeric,
      user.fullName,
      user.role,
      instNumeric,
      inst ? inst.name : 'Verified Blood Centre',
      unitsOffered || 2,
      componentOffered || 'Packed Red Blood Cells (PRBC)',
      estimatedPreparationMinutes || 25,
      responseMessage || 'Stock verified and ready for cold-chain reservation hold.'
    ]);

    // Update request status to RESPONSES_RECEIVED and increment count
    await db.pool.query(`
      UPDATE network_blood_requests 
      SET status = 'RESPONSES_RECEIVED', 
          responses_count = responses_count + 1,
          updated_at = NOW(3)
      WHERE id = ?
    `, [requestId]);

    // Broadcast live event
    wsGateway.broadcastEmergencyAlert({
      type: 'NETWORK_REQUEST_RESPONSE_SUBMITTED',
      requestId: Number(requestId),
      responseId: result.insertId,
      respondingInstitutionName: inst ? inst.name : 'Verified Blood Centre',
      unitsOffered: unitsOffered || 2,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Verified blood availability response submitted.',
      responseId: result.insertId,
      status: 'SUBMITTED'
    });
  } catch (err: any) {
    console.error('Error responding to network request:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});
