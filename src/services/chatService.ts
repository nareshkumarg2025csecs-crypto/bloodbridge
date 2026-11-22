// Chat Service
// Integrates Official Nexconn Chat SDK (@nexconn/chat & @nexconn/engine)
// with BloodBridge MySQL persistence & encrypted inter-hospital channel routing

import { fetchWithAuth } from './apiClient';
import { NCEngine, DirectChannel, SendTextMessageParams, MessageHandler, ConnectionStatusHandler } from '@nexconn/chat';

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderType: 'hospital' | 'user';
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  online: boolean;
  avatarLetter: string;
}

type MessageCallback = (msg: ChatMessage) => void;

class ChatService {
  private messageListeners: MessageCallback[] = [];
  private isNexconnInitialized = false;
  private isNexconnConnected = false;
  private appKey = '';
  private currentUserId = '';

  private fallbackConversations: ConversationItem[] = [
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

  /**
   * Initializes the official Nexconn Chat SDK engine
   * Fetches credentials and token from backend /api/v1/chat/token
   */
  async connect(): Promise<boolean> {
    try {
      const res = await fetchWithAuth('/chat/token');
      if (res.ok) {
        const authData = await res.json();
        this.appKey = authData.appKey;
        this.currentUserId = authData.userId;

        if (this.appKey && !this.isNexconnInitialized) {
          NCEngine.initialize({ appKey: this.appKey });
          this.isNexconnInitialized = true;

          // Register connection status listener
          NCEngine.addConnectionStatusHandler('bb-conn-handler', new ConnectionStatusHandler({
            onConnectionStatusChanged: ({ status, code }) => {
              console.log('[Nexconn SDK] Connection Status Changed:', status, 'Code:', code);
            }
          }));

          // Register message handler for live incoming messages
          NCEngine.addMessageHandler('bb-msg-handler', new MessageHandler({
            onMessageReceived: ({ messages }) => {
              console.log('[Nexconn SDK] Real-time messages received from cloud:', messages);
              messages.forEach((m: any) => {
                const incoming: ChatMessage = {
                  id: m.messageId || `nc-${Date.now()}`,
                  channelId: m.targetId,
                  senderId: m.senderUserId,
                  senderName: m.senderUserId,
                  senderType: 'hospital',
                  text: m.content?.content || m.content?.text || '[Message]',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isSelf: m.senderUserId === this.currentUserId,
                };
                this.messageListeners.forEach((cb) => cb(incoming));
              });
            }
          }));

          // Connect using token if real SDK token provided
          if (authData.isRealSdk && authData.token) {
            const connectRes = await NCEngine.connect({ token: authData.token });
            if (connectRes.code === 0) {
              this.isNexconnConnected = true;
              console.log('[Nexconn SDK] Successfully connected to live Nexconn Cloud for user:', this.currentUserId);
            } else {
              console.warn('[Nexconn SDK] Real connect returned code:', connectRes.code);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Nexconn SDK] Initialization notice:', err);
    }
    return true;
  }

  async getConversations(): Promise<ConversationItem[]> {
    try {
      const response = await fetchWithAuth('/chat/conversations');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Falling back to local conversations');
    }
    return this.fallbackConversations;
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetchWithAuth(`/chat/messages/${channelId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Falling back to local messages');
    }
    return [];
  }

  async sendMessage(channelId: string, text: string): Promise<ChatMessage> {
    // 1. Dispatch through official Nexconn Chat SDK DirectChannel if connected
    if (this.isNexconnConnected) {
      try {
        const targetUserId = channelId.replace(/^ch-/, '');
        const directChannel = new DirectChannel(targetUserId);
        const params = new SendTextMessageParams({ text });
        const sendResult = await directChannel.sendMessage(params);
        console.log('[Nexconn SDK] DirectChannel message sent result:', sendResult);
      } catch (sdkErr) {
        console.warn('[Nexconn SDK] DirectChannel transmit notice:', sdkErr);
      }
    }

    // 2. Persist to authoritative backend MySQL repository
    try {
      const response = await fetchWithAuth(`/chat/messages/${channelId}`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const msg = await response.json();
        this.messageListeners.forEach((cb) => cb(msg));
        return msg;
      }
    } catch (err) {
      console.warn('Falling back to local message dispatch');
    }

    const fallbackMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      channelId,
      senderId: 'self',
      senderName: 'Rajalakshmi Hospital',
      senderType: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    this.messageListeners.forEach((cb) => cb(fallbackMsg));
    return fallbackMsg;
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }
}

export const chatService = new ChatService();
