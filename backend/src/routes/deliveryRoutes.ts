import { Router, Request, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';
import { wsGateway } from '../websocket/gateway';

export const deliveryRouter = Router();

// GET /api/v1/deliveries
// List deliveries relevant to requesting or supplying or receiving institution
deliveryRouter.get('/', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userInstNumeric = user.institutionId ? user.institutionId.replace(/\D/g, '') : null;

    let query = `
      SELECT 
        d.*,
        si.name as supplier_name,
        sb.area as supplier_area,
        ri.name as receiving_name,
        rb.area as receiving_area,
        req.request_code,
        req.units_requested,
        req.urgency_level,
        bg.label as blood_group,
        bc.name as component_name
      FROM deliveries d
      JOIN institutions si ON d.supplier_institution_id = si.id
      JOIN institution_branches sb ON d.supplier_branch_id = sb.id
      JOIN institutions ri ON d.receiving_institution_id = ri.id
      JOIN institution_branches rb ON d.receiving_branch_id = rb.id
      JOIN blood_requests req ON d.request_id = req.id
      JOIN blood_groups bg ON req.blood_group_id = bg.id
      JOIN blood_components bc ON req.blood_component_id = bc.id
    `;

    const params: any[] = [];
    if (user.role !== 'SUPER_ADMIN' && userInstNumeric) {
      query += ` WHERE d.supplier_institution_id = ? OR d.requesting_institution_id = ? OR d.receiving_institution_id = ?`;
      params.push(userInstNumeric, userInstNumeric, userInstNumeric);
    }

    query += ` ORDER BY d.created_at DESC`;

    const [rows] = await db.pool.query(query, params);
    res.status(200).json({ deliveries: rows });
  } catch (err: any) {
    console.error('Error fetching deliveries:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// GET /api/v1/deliveries/:id
// Get single delivery details with GPS trace history
deliveryRouter.get('/:id', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deliveryId = req.params.id;
    const [rows]: any = await db.pool.query(
      `SELECT 
        d.*,
        si.name as supplier_name,
        si.official_phone as supplier_phone,
        sb.address_line1 as supplier_address,
        sb.latitude as supplier_lat,
        sb.longitude as supplier_lng,
        sb.area as supplier_area,
        ri.name as receiving_name,
        ri.official_phone as receiving_phone,
        rb.address_line1 as receiving_address,
        rb.latitude as receiving_lat,
        rb.longitude as receiving_lng,
        rb.area as receiving_area,
        req.request_code,
        req.units_requested,
        req.urgency_level,
        bg.label as blood_group,
        bc.name as component_name
      FROM deliveries d
      JOIN institutions si ON d.supplier_institution_id = si.id
      JOIN institution_branches sb ON d.supplier_branch_id = sb.id
      JOIN institutions ri ON d.receiving_institution_id = ri.id
      JOIN institution_branches rb ON d.receiving_branch_id = rb.id
      JOIN blood_requests req ON d.request_id = req.id
      JOIN blood_groups bg ON req.blood_group_id = bg.id
      JOIN blood_components bc ON req.blood_component_id = bc.id
      WHERE d.id = ? OR d.delivery_code = ?`,
      [deliveryId, deliveryId]
    );

    if (rows.length === 0) {
      res.status(404).json({ title: 'Not Found', detail: 'Delivery record not found' });
      return;
    }

    const delivery = rows[0];

    // Fetch GPS trail
    const [gpsLogs]: any = await db.pool.query(
      `SELECT latitude, longitude, accuracy, speed, heading, recorded_at 
       FROM delivery_gps_logs 
       WHERE delivery_id = ? 
       ORDER BY recorded_at ASC`,
      [delivery.id]
    );

    res.status(200).json({
      delivery,
      gpsHistory: gpsLogs,
    });
  } catch (err: any) {
    console.error('Error fetching delivery details:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// POST /api/v1/deliveries/create
// Creates a new delivery record linked to a request & supplier
deliveryRouter.post('/create', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId, supplierInstitutionId, supplierBranchId, receivingInstitutionId, receivingBranchId, vehicleIdentifier, transporterName, transporterPhone } = req.body;

    const deliveryCode = `DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [supplierBranch]: any = await db.pool.query(
      'SELECT latitude, longitude FROM institution_branches WHERE id = ?',
      [supplierBranchId || 1]
    );

    const initLat = supplierBranch[0]?.latitude || 13.08268000;
    const initLng = supplierBranch[0]?.longitude || 80.24350000;

    const [result]: any = await db.pool.query(
      `INSERT INTO deliveries (
        delivery_code, request_id, supplier_institution_id, supplier_branch_id,
        requesting_institution_id, receiving_institution_id, receiving_branch_id,
        vehicle_identifier, transporter_name, transporter_phone, status,
        current_latitude, current_longitude, last_gps_update_at, expected_arrival_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUPPLIER_ACCEPTED', ?, ?, NOW(3), DATE_ADD(NOW(3), INTERVAL 45 MINUTE))`,
      [
        deliveryCode,
        requestId,
        supplierInstitutionId,
        supplierBranchId || 1,
        req.user?.institutionId ? req.user.institutionId.replace(/\D/g, '') : 1,
        receivingInstitutionId,
        receivingBranchId || 1,
        vehicleIdentifier || 'TN-01-MED-2026',
        transporterName || 'Authorized Medical Courier',
        transporterPhone || '+919840012345',
        initLat,
        initLng
      ]
    );

    const insertedId = result.insertId;

    // Log initial GPS position
    await db.pool.query(
      `INSERT INTO delivery_gps_logs (delivery_id, latitude, longitude, accuracy, speed, heading)
       VALUES (?, ?, ?, 5.0, 0.0, 0.0)`,
      [insertedId, initLat, initLng]
    );

    // Broadcast WebSocket notification
    wsGateway.broadcastEmergencyAlert({
      type: 'DELIVERY_INITIATED',
      deliveryId: insertedId,
      deliveryCode,
      requestId,
      status: 'SUPPLIER_ACCEPTED'
    });

    res.status(201).json({
      message: 'Delivery record created successfully',
      deliveryId: insertedId,
      deliveryCode,
      status: 'SUPPLIER_ACCEPTED'
    });
  } catch (err: any) {
    console.error('Error creating delivery:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// POST /api/v1/deliveries/:id/status
// Update delivery progression status (PREPARING, DISPATCH_AUTHORIZED, IN_TRANSIT, ARRIVED, RECEIVED, COMPLETED, CANCELLED)
deliveryRouter.post('/:id/status', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deliveryId = req.params.id;
    const { status, handoverNotes, handoverProofCode } = req.body;

    const validStatuses = [
      'REQUESTED', 'SUPPLIER_ACCEPTED', 'RESERVED', 'PREPARING',
      'DISPATCH_AUTHORIZED', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED',
      'COMPLETED', 'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ title: 'Invalid Status', detail: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    let extraSet = '';
    const params: any[] = [status];

    if (status === 'DISPATCH_AUTHORIZED') {
      extraSet += ', dispatch_authorized_at = NOW(3)';
    } else if (status === 'IN_TRANSIT') {
      extraSet += ', dispatched_at = NOW(3)';
    } else if (status === 'ARRIVED') {
      extraSet += ', actual_arrival_at = NOW(3)';
    } else if (status === 'COMPLETED' || status === 'RECEIVED') {
      extraSet += ', handover_confirmed_at = NOW(3), handover_confirmed_by = ?, handover_notes = ?, handover_proof_code = ?';
      const userNumeric = req.user?.id ? req.user.id.replace(/\D/g, '') : null;
      params.push(userNumeric || 1, handoverNotes || 'Cold-chain verification passed. Physical handover confirmed.', handoverProofCode || `PROOF-${Date.now()}`);
    }

    params.push(deliveryId);

    await db.pool.query(
      `UPDATE deliveries SET status = ? ${extraSet}, updated_at = NOW(3) WHERE id = ?`,
      params
    );

    // Broadcast live WebSocket event
    wsGateway.broadcastEmergencyAlert({
      type: 'DELIVERY_STATUS_UPDATED',
      deliveryId: Number(deliveryId),
      status,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      message: `Delivery status updated to ${status}`,
      deliveryId,
      status
    });
  } catch (err: any) {
    console.error('Error updating delivery status:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});

// POST /api/v1/deliveries/:id/gps
// Driver/Transporter GPS Telemetry update endpoint
deliveryRouter.post('/:id/gps', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deliveryId = req.params.id;
    const { latitude, longitude, accuracy, speed, heading } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ title: 'Bad Request', detail: 'Valid latitude and longitude numbers are required' });
      return;
    }

    // Verify delivery is in an active tracking state
    const [delRows]: any = await db.pool.query(
      'SELECT id, status FROM deliveries WHERE id = ?',
      [deliveryId]
    );

    if (delRows.length === 0) {
      res.status(404).json({ title: 'Not Found', detail: 'Delivery not found' });
      return;
    }

    const currentStatus = delRows[0].status;
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      res.status(400).json({
        title: 'Tracking Closed',
        detail: `Cannot accept GPS updates for delivery in status ${currentStatus}. Tracking ceases upon completion.`
      });
      return;
    }

    const userNumeric = req.user?.id ? req.user.id.replace(/\D/g, '') : null;

    // Insert telemetry into gps logs
    await db.pool.query(
      `INSERT INTO delivery_gps_logs (delivery_id, transporter_user_id, latitude, longitude, accuracy, speed, heading)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [deliveryId, userNumeric || 1, latitude, longitude, accuracy || 5.0, speed || 35.0, heading || 0.0]
    );

    // Update current location in deliveries
    await db.pool.query(
      `UPDATE deliveries 
       SET current_latitude = ?, current_longitude = ?, last_gps_update_at = NOW(3)
       WHERE id = ?`,
      [latitude, longitude, deliveryId]
    );

    // Broadcast GPS telemetry event to connected hospital sessions via WebSocket
    wsGateway.broadcastEmergencyAlert({
      type: 'GPS_TELEMETRY_UPDATE',
      deliveryId: Number(deliveryId),
      latitude,
      longitude,
      speed: speed || 35.0,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      message: 'GPS telemetry recorded and broadcasted',
      deliveryId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error logging GPS telemetry:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});
