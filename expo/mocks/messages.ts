import { ChatMessage, ChatRoom, DirectMessage } from '@/types';

export const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    tournamentId: '1',
    tournamentName: 'Spring Championship Open',
    participants: 24,
    lastMessage: {
      id: 'm1',
      userId: 'u2',
      userName: 'Sarah Chen',
      message: 'Anyone looking for a doubles partner?',
      timestamp: '2025-01-06T10:30:00Z'
    },
    unreadCount: 3
  },
  {
    id: '2',
    tournamentId: '2',
    tournamentName: 'Junior Development Series',
    participants: 15,
    lastMessage: {
      id: 'm2',
      userId: 'u3',
      userName: 'Coach Mike',
      message: 'Great practice courts available nearby',
      timestamp: '2025-01-06T09:15:00Z'
    },
    unreadCount: 0
  }
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    userId: 'u2',
    userName: 'Sarah Chen',
    message: 'Anyone looking for a doubles partner for the Spring Championship?',
    timestamp: '2025-01-06T10:30:00Z',
    tournamentId: '1'
  },
  {
    id: 'm2',
    userId: 'u3',
    userName: 'Mike Johnson',
    message: "I'm interested! What's your UTR?",
    timestamp: '2025-01-06T10:32:00Z',
    tournamentId: '1'
  },
  {
    id: 'm3',
    userId: 'u2',
    userName: 'Sarah Chen',
    message: "I'm around 7.5, mostly play baseline",
    timestamp: '2025-01-06T10:33:00Z',
    tournamentId: '1'
  }
];

export const mockDirectMessages: DirectMessage[] = [
  {
    id: 'dm1',
    participants: [
      {
        id: 'u1',
        email: 'john@example.com',
        name: 'John Doe',
        utr: 8.2,
        preferredSurfaces: ['Hard Court'],
        availability: ['Weekend Mornings'],
        location: 'Los Angeles, CA',
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'u2',
        email: 'sarah@example.com',
        name: 'Sarah Chen',
        utr: 7.5,
        preferredSurfaces: ['Clay Court'],
        availability: ['Weekday Evenings'],
        location: 'Los Angeles, CA',
        createdAt: '2025-01-01T00:00:00Z'
      }
    ],
    lastMessage: {
      id: 'dm1m1',
      userId: 'u2',
      userName: 'Sarah Chen',
      message: 'Want to practice before the tournament?',
      timestamp: '2025-01-06T11:00:00Z',
      recipientId: 'u1'
    },
    unreadCount: 1
  }
];