export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  utr?: number;
  ntrp?: string;
  preferredSurfaces: string[];
  availability: string[];
  location: string;
  bio?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  surface: string;
  ageGroups: string[];
  skillLevels: string[];
  entryFee: number;
  description: string;
  imageUrl: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  tournamentId?: string;
  recipientId?: string;
}

export interface ChatRoom {
  id: string;
  tournamentId: string;
  tournamentName: string;
  participants: number;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface DirectMessage {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}