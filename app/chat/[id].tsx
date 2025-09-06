import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useChat } from '@/hooks/chat-context';
import { useAuth } from '@/hooks/auth-context';
import { useTournaments } from '@/hooks/tournaments-context';
import { COLORS } from '@/constants/tennis';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  const { currentMessages, sendMessage, loadTournamentChat } = useChat();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const tournamentId = id as string;
  const tournament = tournaments.find(t => t.id === tournamentId);

  useEffect(() => {
    loadTournamentChat(tournamentId);
  }, [tournamentId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [currentMessages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message, tournamentId);
      setMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {tournament && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{tournament.name}</Text>
            <Text style={styles.headerSubtitle}>Tournament Chat</Text>
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {currentMessages.map((msg) => {
            const isOwnMessage = msg.userId === user?.id;
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isOwnMessage && styles.messageRowOwn
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isOwnMessage && styles.messageBubbleOwn
                  ]}
                >
                  {!isOwnMessage && (
                    <Text style={styles.messageName}>{msg.userName}</Text>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      isOwnMessage && styles.messageTextOwn
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isOwnMessage && styles.messageTimeOwn
                    ]}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.secondary,
  },
  messageName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: COLORS.surface,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: COLORS.surface,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});