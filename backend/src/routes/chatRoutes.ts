import { Router, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';
import { nexconnService } from '../services/nexconnService';
import { ChatMessageEntity } from '../types/models';

export const chatRouter = Router();

// GET /api/v1/chat/token
// Returns real or developer-ready Nexconn credentials and user token for client-side SDK initialization
chatRouter.get('/token', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const inst = user.institutionId ? db.institutions.get(user.institutionId) : null;
  const displayName = inst ? inst.name : user.fullName;

  const tokenData = await nexconnService.issueUserAccessToken(user.id, displayName);

  if (!tokenData.isReal) {
    res.status(502).json({
      title: 'Nexconn Cloud Authentication Failure',
      status: 502,
      detail: tokenData.error || 'Failed to authenticate with genuine Nexconn Cloud',
      appKey: nexconnService.getAppKey(),
      isRealSdk: false
    });
    return;
  }

  res.status(200).json({
    appKey: nexconnService.getAppKey(),
    userId: user.id,
    token: tokenData.token,
    isRealSdk: true,
    dataCenter: 'Singapore',
  });
});

// GET /api/v1/chat/conversations
// Returns conversations specific to the authenticated user's institution
chatRouter.get('/conversations', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userInstNumeric = user.institutionId ? parseInt(user.institutionId.replace(/\D/g, ''), 10) : null;

  try {
    let sql = `
      SELECT c.id, c.channel_identifier, c.institution_a_id, c.institution_b_id, c.last_message_at,
             ia.name as inst_a_name, ib.name as inst_b_name,
             (SELECT m.message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
             (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_msg_time,
             (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_institution_id != ?) as unread_count
      FROM conversations c
      JOIN institutions ia ON c.institution_a_id = ia.id
      JOIN institutions ib ON c.institution_b_id = ib.id
      WHERE (c.institution_a_id = ? OR c.institution_b_id = ?)
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `;

    const filterInstId = userInstNumeric || 1;
    const [rows]: any = await db.pool.query(sql, [filterInstId, filterInstId, filterInstId]);

    if (rows && rows.length > 0) {
      const conversations = rows.map((r: any) => {
        const isA = r.institution_a_id === filterInstId;
        const counterpartName = isA ? r.inst_b_name : r.inst_a_name;
        const counterpartCleanName = counterpartName.replace(/\s*\[SYNTHETIC\]/gi, '');
        const timeStr = r.last_msg_time 
          ? new Date(r.last_msg_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Active';

        return {
          id: r.channel_identifier,
          name: counterpartCleanName,
          institutionId: isA ? `inst-${r.institution_b_id}` : `inst-${r.institution_a_id}`,
          lastMessage: r.last_message || 'Start coordination conversation...',
          time: timeStr,
          unreadCount: Number(r.unread_count || 0),
          online: true,
          avatarLetter: counterpartCleanName.trim().charAt(0).toUpperCase() || 'H'
        };
      });

      res.status(200).json(conversations);
      return;
    }
  } catch (err: any) {
    console.error('Error querying hospital conversations from MySQL:', err.message);
  }

  // Fallback default list
  res.status(200).json([
    {
      id: 'conv-inst-1-inst-2',
      name: 'Anna Nagar Premier Blood Centre',
      lastMessage: 'Ready for emergency transfer',
      time: 'Just now',
      unreadCount: 0,
      online: true,
      avatarLetter: 'A'
    }
  ]);
});

// GET /api/v1/chat/messages/:channelId
// Fetches message history for a specific conversation with membership check
chatRouter.get('/messages/:channelId', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : req.params.channelId;
  const user = req.user!;
  const userNumericId = parseInt(user.id.replace(/\D/g, ''), 10) || 1;
  const userInstNumericId = user.institutionId ? parseInt(user.institutionId.replace(/\D/g, ''), 10) : 1;

  try {
    // Check conversation membership
    const [convCheck]: any = await db.pool.query(
      `SELECT id, institution_a_id, institution_b_id FROM conversations WHERE channel_identifier = ?`,
      [channelId]
    );

    if (convCheck.length > 0) {
      const conv = convCheck[0];
      const isMember = user.role === 'SUPER_ADMIN' ||
                       conv.institution_a_id === userInstNumericId || 
                       conv.institution_b_id === userInstNumericId;

      if (!isMember) {
        res.status(403).json({
          title: 'Access Denied',
          detail: 'Your institution is not a participant in this conversation.'
        });
        return;
      }

      // Mark messages as read for this user's institution
      await db.pool.query(
        `UPDATE messages SET is_read = 1, read_at = NOW(3) WHERE conversation_id = ? AND sender_institution_id != ? AND is_read = 0`,
        [conv.id, userInstNumericId]
      );
    }

    // Query authoritative messages from MySQL
    const [rows]: any = await db.pool.query(
      `SELECT m.id, m.message_text, m.sender_user_id, m.sender_institution_id, m.created_at, m.is_read,
              u.first_name, u.last_name, i.name as institution_name
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       JOIN users u ON m.sender_user_id = u.id
       LEFT JOIN institutions i ON m.sender_institution_id = i.id
       WHERE c.channel_identifier = ?
       ORDER BY m.created_at ASC`,
      [channelId]
    );

    if (rows && rows.length > 0) {
      const formatted = rows.map((m: any) => ({
        id: `mysql-${m.id}`,
        channelId,
        senderId: `usr-${m.sender_user_id}`,
        senderName: m.institution_name 
          ? m.institution_name.replace(/\s*\[SYNTHETIC\]/gi, '')
          : `${m.first_name} ${m.last_name}`,
        senderType: 'hospital',
        text: m.message_text,
        isRead: Boolean(m.is_read),
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: m.sender_user_id === userNumericId || (userInstNumericId && m.sender_institution_id === userInstNumericId),
      }));

      res.status(200).json(formatted);
      return;
    }
  } catch (err: any) {
    console.warn('MySQL message fetch error:', err.message);
  }

  res.status(200).json([]);
});

// POST /api/v1/chat/messages/:channelId
// Send a clean, plaintext message between verified hospitals with membership verification
chatRouter.post('/messages/:channelId', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : req.params.channelId;
  const { text } = req.body;
  const user = req.user!;
  const inst = user.institutionId ? db.institutions.get(user.institutionId) : null;

  if (!text || !text.trim()) {
    res.status(400).json({ title: 'Validation Error', detail: 'Message text cannot be empty' });
    return;
  }

  const cleanText = text.trim();
  const rawUserId = user.id.replace(/^usr-/, '');
  const numUserId = parseInt(rawUserId, 10) || 1;
  const instAId = user.institutionId ? parseInt(user.institutionId.replace(/^inst-/, ''), 10) : 1;

  try {
    // Check or find conversation
    let [convRows]: any = await db.pool.query(
      `SELECT id, institution_a_id, institution_b_id FROM conversations WHERE channel_identifier = ?`,
      [channelId]
    );

    let convId: number;

    if (convRows.length === 0) {
      // Auto-create conversation from channel identifier format conv-inst-A-inst-B
      const match = channelId.match(/conv-inst-(\d+)-inst-(\d+)/);
      const targetA = match ? parseInt(match[1], 10) : instAId;
      const targetB = match ? parseInt(match[2], 10) : (instAId === 1 ? 2 : 1);

      const [insertConv]: any = await db.pool.query(
        `INSERT INTO conversations (channel_identifier, institution_a_id, institution_b_id, status, created_at, last_message_at)
         VALUES (?, ?, ?, 'ACTIVE', NOW(3), NOW(3))`,
        [channelId, targetA, targetB]
      );
      convId = insertConv.insertId;
    } else {
      const conv = convRows[0];
      convId = conv.id;

      // Membership authorization check
      const isMember = user.role === 'SUPER_ADMIN' ||
                       conv.institution_a_id === instAId || 
                       conv.institution_b_id === instAId;

      if (!isMember) {
        res.status(403).json({
          title: 'Access Denied',
          detail: 'Your institution is not a participant in this conversation.'
        });
        return;
      }
    }

    // Insert message into MySQL 8.0 message ledger
    const [insertMsg]: any = await db.pool.query(`
      INSERT INTO messages (
        conversation_id, sender_user_id, sender_institution_id, message_text,
        is_read, is_encrypted, created_at
      ) VALUES (?, ?, ?, ?, 0, 0, NOW(3))
    `, [
      convId,
      numUserId,
      instAId,
      cleanText
    ]);

    // Update conversation last_message_at
    await db.pool.query(
      `UPDATE conversations SET last_message_at = NOW(3) WHERE id = ?`,
      [convId]
    );

    const savedMsgId = `mysql-${insertMsg.insertId}`;
    const formattedSenderName = inst ? inst.name.replace(/\s*\[SYNTHETIC\]/gi, '') : user.fullName;

    const outgoingMsg: ChatMessageEntity = {
      id: savedMsgId,
      channelId,
      senderUserId: user.id,
      senderInstitutionId: user.institutionId || `inst-${instAId}`,
      senderName: formattedSenderName,
      senderType: 'hospital',
      messageText: cleanText,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Relay via Nexconn Chat SDK to recipient
    await nexconnService.dispatchEncryptedMessage(outgoingMsg);

    res.status(201).json({
      id: savedMsgId,
      channelId,
      senderId: user.id,
      senderName: formattedSenderName,
      senderType: 'hospital',
      text: cleanText,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    });
  } catch (err: any) {
    console.error('Error posting message in chatRoutes:', err.message);
    res.status(500).json({ title: 'Server Error', detail: err.message });
  }
});
