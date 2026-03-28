import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { ChatMessage, ChatRoom, DirectMessage } from '@/types';
import { mockChatRooms, mockMessages, mockDirectMessages } from '@/mocks/messages';
import { useAuth } from '@/hooks/auth-context';

interface ChatState {
  chatRooms: ChatRoom[];
  directMessages: DirectMessage[];
  currentMessages: ChatMessage[];
  sendMessage: (message: string, tournamentId?: string, recipientId?: string) => void;
  loadTournamentChat: (tournamentId: string) => void;
  loadDirectMessages: (recipientId: string) => void;
}

export const [ChatProvider, useChat] = createContextHook<ChatState>(() => {
  const { user } = useAuth();
  const [chatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [directMessages] = useState<DirectMessage[]>(mockDirectMessages);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>(mockMessages);

  const sendMessage = (message: string, tournamentId?: string, recipientId?: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message,
      timestamp: new Date().toISOString(),
      tournamentId,
      recipientId
    };

    setAllMessages(prev => [...prev, newMessage]);
    setCurrentMessages(prev => [...prev, newMessage]);
  };

  const loadTournamentChat = (tournamentId: string) => {
    const messages = allMessages.filter(m => m.tournamentId === tournamentId);
    setCurrentMessages(messages);
  };

  const loadDirectMessages = (recipientId: string) => {
    const messages = allMessages.filter(m => 
      (m.recipientId === recipientId && m.userId === user?.id) ||
      (m.recipientId === user?.id && m.userId === recipientId)
    );
    setCurrentMessages(messages);
  };

  return {
    chatRooms,
    directMessages,
    currentMessages,
    sendMessage,
    loadTournamentChat,
    loadDirectMessages
  };
});