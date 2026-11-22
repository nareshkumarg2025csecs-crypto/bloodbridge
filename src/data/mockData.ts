export interface BloodStock {
  id: string;
  type: string;
  units: number;
  rh: '+' | '-';
  color: string;
}

export interface StatSummary {
  totalUnits: number;
  partnerBanksCount: number;
  transfersToday: number;
}

export interface ExpiryAlertItem {
  id: string;
  title: string;
  description: string;
  bloodType: string;
  units: number;
  expiresInDays: number;
  urgency: 'urgent' | 'warning' | 'info';
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'hospital' | 'user';
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  online?: boolean;
  avatarLetter: string;
}

export interface HospitalProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  license: string;
  avatarLetter: string;
}

export const initialStats: StatSummary = {
  totalUnits: 245,
  partnerBanksCount: 12,
  transfersToday: 8,
};

export const initialBloodInventory: BloodStock[] = [
  { id: '1', type: 'A+', units: 55, rh: '+', color: '#EF4444' },
  { id: '2', type: 'A-', units: 28, rh: '-', color: '#0EA5E9' },
  { id: '3', type: 'B+', units: 40, rh: '+', color: '#2563EB' },
  { id: '4', type: 'B-', units: 22, rh: '-', color: '#10B981' },
  { id: '5', type: 'O+', units: 55, rh: '+', color: '#F59E0B' },
  { id: '6', type: 'O-', units: 30, rh: '-', color: '#14B8A6' },
  { id: '7', type: 'AB+', units: 18, rh: '+', color: '#3B82F6' },
  { id: '8', type: 'AB-', units: 12, rh: '-', color: '#0284C7' },
];

export const initialAlerts: ExpiryAlertItem[] = [
  {
    id: 'alt-1',
    title: 'Expiry Alert',
    description: '2 units of O+ will expire in 2 days',
    bloodType: 'O+',
    units: 2,
    expiresInDays: 2,
    urgency: 'urgent',
    timestamp: 'Today at 09:15 AM'
  },
  {
    id: 'alt-2',
    title: 'Shelf-Life Warning',
    description: '1 unit of B- will expire in 4 days',
    bloodType: 'B-',
    units: 1,
    expiresInDays: 4,
    urgency: 'warning',
    timestamp: 'Yesterday at 04:30 PM'
  }
];

export const initialChannels: ChatChannel[] = [
  {
    id: 'ch-1',
    name: 'City General Hospital',
    lastMessage: 'Need 10 units of B+',
    time: '10:24 AM',
    avatarLetter: 'C',
    online: true,
  },
  {
    id: 'ch-2',
    name: 'Apollo Blood Bank',
    lastMessage: 'Available now',
    time: '9:45 AM',
    avatarLetter: 'A',
    online: false,
  },
  {
    id: 'ch-3',
    name: 'Care Hospital',
    lastMessage: 'Can transfer by today?',
    time: 'Yesterday',
    avatarLetter: 'C',
    online: false,
  },
];

export const initialChatMessages: Record<string, ChatMessage[]> = {
  'ch-1': [
    {
      id: 'm1',
      senderId: 'hosp-city',
      senderName: 'City General Hospital',
      senderType: 'hospital',
      text: 'We have 10 units of B+ available.',
      timestamp: '10:25 AM',
      isSelf: false,
    },
    {
      id: 'm2',
      senderId: 'self',
      senderName: 'Rajalakshmi Hospital',
      senderType: 'user',
      text: 'Great! Please confirm the transfer.',
      timestamp: '10:26 AM',
      isSelf: true,
    },
  ],
};

export const currentHospital: HospitalProfile = {
  id: 'hosp-rajalakshmi',
  name: 'Rajalakshmi Hospital',
  email: 'rajalakshmi@bloodbridge.in',
  phone: '+91 98400 12345',
  address: 'Thandalam, Chennai, Tamil Nadu 602105',
  license: 'BB-TN-2024-8891',
  avatarLetter: 'R',
};
