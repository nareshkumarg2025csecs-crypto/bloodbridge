import { Router, Response } from 'express';
import { db } from '../database/repository';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/authMiddleware';
import { nexconnService } from '../services/nexconnService';
import { ChatMessageEntity } from '../types/models';

export const chatRouter = Router();

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
  const { channelId } = req.params;
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
  const { channelId } = req.params;
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
