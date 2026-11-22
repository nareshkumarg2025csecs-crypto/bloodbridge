// Chat Service
// Inter-institutional real-time communication
// TODO: integrate Nexconn Chat SDK here (E2E Encrypted Channel)

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

  private conversations: ConversationItem[] = [
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

  private messageStore: Record<string, ChatMessage[]> = {
    'ch-city': [
      {
        id: 'm1',
        channelId: 'ch-city',
        senderId: 'hosp-city',
        senderName: 'City General Hospital',
        senderType: 'hospital',
        text: 'We have 10 units of B+ available.',
        timestamp: '10:24 AM',
        isSelf: false,
      },
      {
        id: 'm2',
        channelId: 'ch-city',
        senderId: 'self',
        senderName: 'Rajalakshmi Hospital',
        senderType: 'user',
        text: 'Great! Please confirm the transfer.',
        timestamp: '10:26 AM',
        isSelf: true,
      },
    ],
    'ch-apollo': [
      {
        id: 'm-ap-1',
        channelId: 'ch-apollo',
        senderId: 'hosp-apollo',
        senderName: 'Apollo Blood Bank',
        senderType: 'hospital',
        text: 'Hello Rajalakshmi Hospital, A+ units are in stock.',
        timestamp: '9:40 AM',
        isSelf: false,
      },
      {
        id: 'm-ap-2',
        channelId: 'ch-apollo',
        senderId: 'self',
        senderName: 'Rajalakshmi Hospital',
        senderType: 'user',
        text: 'Understood. We will place a reservation shortly.',
        timestamp: '9:45 AM',
        isSelf: true,
      },
    ],
    'ch-care': [
      {
        id: 'm-ca-1',
        channelId: 'ch-care',
        senderId: 'hosp-care',
        senderName: 'Care Hospital',
        senderType: 'hospital',
        text: 'Can transfer by today? Urgent patient in ICU.',
        timestamp: 'Yesterday',
        isSelf: false,
      },
    ],
  };

  async connect(): Promise<boolean> {
    // TODO: integrate Nexconn Chat SDK here
    await new Promise((r) => setTimeout(r, 100));
    return true;
  }

  async getConversations(): Promise<ConversationItem[]> {
    // TODO: integrate Nexconn Chat SDK here
    await new Promise((r) => setTimeout(r, 100));
    return [...this.conversations];
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    // TODO: integrate Nexconn Chat SDK here
    await new Promise((r) => setTimeout(r, 100));
    return this.messageStore[channelId] ? [...this.messageStore[channelId]] : [];
  }

  async sendMessage(channelId: string, text: string): Promise<ChatMessage> {
    // TODO: integrate Nexconn Chat SDK here
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      channelId,
      senderId: 'self',
      senderName: 'Rajalakshmi Hospital',
      senderType: 'user',
      text,
      timestamp: timeNow,
      isSelf: true,
    };

    if (!this.messageStore[channelId]) {
      this.messageStore[channelId] = [];
    }
    this.messageStore[channelId].push(userMsg);

    // Update conversation preview
    const conv = this.conversations.find((c) => c.id === channelId);
    if (conv) {
      conv.lastMessage = text;
      conv.time = timeNow;
    }

    // Trigger fake auto-reply after ~1.5 seconds
    setTimeout(() => {
      const replies: Record<string, string> = {
        'ch-city': 'Transfer initiated! Logistic ambulance dispatched with temperature control.',
        'ch-apollo': 'Acknowledged. Our logistics team will arrive with the units.',
        'ch-care': 'Thank you! We will update the blood transfer audit log immediately.',
      };

      const replyText = replies[channelId] || 'Acknowledged. Transfer record locked in inventory.';
      const replyMsg: ChatMessage = {
        id: 'reply_' + Date.now(),
        channelId,
        senderId: channelId,
        senderName: conv?.name || 'Partner Bank',
        senderType: 'hospital',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
      };

      this.messageStore[channelId].push(replyMsg);
      this.notifyListeners(replyMsg);
    }, 1500);

    return userMsg;
  }

  onMessage(cb: MessageCallback): () => void {
    // TODO: integrate Nexconn Chat SDK here
    this.messageListeners.push(cb);
    return () => {
      this.messageListeners = this.messageListeners.filter((listener) => listener !== cb);
    };
  }

  private notifyListeners(msg: ChatMessage) {
    this.messageListeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in message callback:', e);
      }
    });
  }
}

export const chatService = new ChatService();
