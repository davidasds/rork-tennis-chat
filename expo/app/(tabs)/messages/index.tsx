import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Users, ChevronRight } from 'lucide-react-native';
import { useChat } from '@/hooks/chat-context';
import { useAuth } from '@/hooks/auth-context';
import { COLORS } from '@/constants/tennis';

export default function MessagesScreen() {
  const { chatRooms, directMessages } = useChat();
  const { isAuthenticated } = useAuth();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <MessageCircle size={64} color={COLORS.textSecondary} />
          <Text style={styles.loginTitle}>Join the Conversation</Text>
          <Text style={styles.loginSubtitle}>
            Login to chat with other players and find partners
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tournament Chats</Text>
          {chatRooms.map(room => (
            <TouchableOpacity
              key={room.id}
              style={styles.chatItem}
              onPress={() => router.push(`/chat/${room.tournamentId}`)}
            >
              <View style={styles.chatIcon}>
                <Users size={24} color={COLORS.surface} />
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatTitle}>{room.tournamentName}</Text>
                  {room.unreadCount ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{room.unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.chatSubtitle}>
                  {room.participants} participants
                </Text>
                {room.lastMessage && (
                  <View style={styles.lastMessage}>
                    <Text style={styles.lastMessageUser}>
                      {room.lastMessage.userName}:
                    </Text>
                    <Text style={styles.lastMessageText} numberOfLines={1}>
                      {room.lastMessage.message}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatTime(room.lastMessage.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
              <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Messages</Text>
          {directMessages.length === 0 ? (
            <Text style={styles.emptyText}>No direct messages yet</Text>
          ) : (
            directMessages.map(dm => {
              const otherUser = dm.participants.find(p => p.id !== 'u1');
              if (!otherUser) return null;
              
              return (
                <TouchableOpacity
                  key={dm.id}
                  style={styles.chatItem}
                  onPress={() => router.push(`/chat/dm-${otherUser.id}`)}
                >
                  <View style={styles.avatarContainer}>
                    {otherUser.avatar ? (
                      <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatTitle}>{otherUser.name}</Text>
                      {dm.unreadCount ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{dm.unreadCount}</Text>
                        </View>
                      ) : null}
                    </View>
                    {otherUser.utr && (
                      <Text style={styles.chatSubtitle}>UTR {otherUser.utr}</Text>
                    )}
                    {dm.lastMessage && (
                      <View style={styles.lastMessage}>
                        <Text style={styles.lastMessageText} numberOfLines={1}>
                          {dm.lastMessage.message}
                        </Text>
                        <Text style={styles.messageTime}>
                          {formatTime(dm.lastMessage.timestamp)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ChevronRight size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    flex: 1,
  },
  chatSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessageUser: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: COLORS.text,
    marginRight: 4,
  },
  lastMessageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingVertical: 32,
  },
});