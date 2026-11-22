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
chatRouter.get('/conversations', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const conversations = [
    {
      id: 'ch-city',
      name: 'City General Hospital',
      lastMessage: 'Need 10 units of B+',
      time: '10:24 AM',
      online: true,
      avatarLetter: 'C',
    },
    {
      id: 'ch-apollo',
      name: 'Apollo Blood Bank',
      lastMessage: 'Available now',
      time: '9:45 AM',
      online: false,
      avatarLetter: 'A',
    },
    {
      id: 'ch-care',
      name: 'Care Hospital',
      lastMessage: 'Can transfer by today?',
      time: 'Yesterday',
      online: false,
      avatarLetter: 'C',
    },
  ];

  res.status(200).json(conversations);
});

// GET /api/v1/chat/messages/:channelId
chatRouter.get('/messages/:channelId', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : req.params.channelId;
  const user = req.user!;
  const rawMessages = db.chatMessages.get(channelId) || [];

  // Format to match frontend ChatMessage structure
  const formatted = rawMessages.map((m) => ({
    id: m.id,
    channelId: m.channelId,
    senderId: m.senderUserId,
    senderName: m.senderName,
    senderType: m.senderType,
    text: m.messageText,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSelf: m.senderUserId === user.id || m.senderInstitutionId === user.institutionId,
  }));

  res.status(200).json(formatted);
});

// POST /api/v1/chat/messages/:channelId
chatRouter.post('/messages/:channelId', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const channelId = Array.isArray(req.params.channelId) ? req.params.channelId[0] : req.params.channelId;
  const { text } = req.body;
  const user = req.user!;
  const inst = user.institutionId ? db.institutions.get(user.institutionId) : null;

  if (!text || !text.trim()) {
    res.status(400).json({ title: 'Validation Error', detail: 'Message text cannot be empty' });
    return;
  }

  const msgId = `m-${Date.now()}`;
  const newMsg: ChatMessageEntity = {
    id: msgId,
    channelId,
    senderUserId: user.id,
    senderInstitutionId: user.institutionId || 'inst-rajalakshmi',
    senderName: inst ? inst.name : user.fullName,
    senderType: 'hospital',
    messageText: text.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (!db.chatMessages.has(channelId)) {
    db.chatMessages.set(channelId, []);
  }
  db.chatMessages.get(channelId)!.push(newMsg);

  // Authoritatively record into MySQL 8.0 message ledger via Prisma
  try {
    const rawUserId = user.id.replace(/^usr-/, '');
    const numUserId = parseInt(rawUserId, 10);
    const instAId = user.institutionId ? parseInt(user.institutionId.replace(/^inst-/, ''), 10) : 1;
    const instBId = instAId === 1 ? 2 : 1;

    if (!isNaN(numUserId)) {
      // Find or create conversation in MySQL
      let conv = await db.prisma.conversation.findFirst({
        where: { channelIdentifier: channelId }
      });
      if (!conv) {
        conv = await db.prisma.conversation.create({
          data: {
            channelIdentifier: channelId,
            institutionAId: BigInt(isNaN(instAId) ? 1 : instAId),
            institutionBId: BigInt(isNaN(instBId) ? 2 : instBId),
            status: 'ACTIVE',
            lastMessageAt: new Date(),
          }
        });
      }
      await db.prisma.message.create({
        data: {
          conversationId: conv.id,
          senderUserId: BigInt(numUserId),
          senderInstitutionId: BigInt(isNaN(instAId) ? 1 : instAId),
          messageText: text.trim(),
          isRead: false,
        }
      });
      console.log(`[MySQL Chat Ledger] Recorded message in MySQL for conversation ${conv.id}`);
    }
  } catch (dbErr) {
    console.warn('[MySQL Chat Ledger] Notice:', dbErr);
  }

  // Relay via Nexconn Chat SDK
  await nexconnService.dispatchEncryptedMessage(newMsg);

  res.status(201).json({
    id: newMsg.id,
    channelId: newMsg.channelId,
    senderId: newMsg.senderUserId,
    senderName: newMsg.senderName,
    senderType: newMsg.senderType,
    text: newMsg.messageText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSelf: true,
  });
});
