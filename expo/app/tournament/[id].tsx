import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  Bookmark,
  BookmarkCheck,
  MessageCircle
} from 'lucide-react-native';
import { useTournaments } from '@/hooks/tournaments-context';
import { useAuth } from '@/hooks/auth-context';
import { COLORS } from '@/constants/tennis';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { tournaments, saveTournament, unsaveTournament, isTournamentSaved } = useTournaments();
  const { isAuthenticated } = useAuth();
  
  const tournament = tournaments.find(t => t.id === id);
  const [isSaved, setIsSaved] = useState(isTournamentSaved(id as string));

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to save tournaments');
      router.push('/auth');
      return;
    }

    if (isSaved) {
      await unsaveTournament(tournament.id);
      setIsSaved(false);
    } else {
      await saveTournament(tournament.id);
      setIsSaved(true);
    }
  };

  const handleJoinChat = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to join the chat');
      router.push('/auth');
      return;
    }
    router.push(`/chat/${tournament.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: tournament.imageUrl }} style={styles.heroImage} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{tournament.name}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              {isSaved ? (
                <BookmarkCheck size={24} color={COLORS.primaryDark} />
              ) : (
                <Bookmark size={24} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MapPin size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{tournament.location}</Text>
                <Text style={styles.infoSubvalue}>{tournament.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dates</Text>
                <Text style={styles.infoValue}>
                  {formatDate(tournament.startDate)}
                </Text>
                <Text style={styles.infoSubvalue}>
                  to {formatDate(tournament.endDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Clock size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Registration Deadline</Text>
                <Text style={styles.infoValue}>
                  {formatDate(tournament.registrationDeadline)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Users size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {tournament.currentParticipants} / {tournament.maxParticipants}
                </Text>
                {tournament.currentParticipants >= tournament.maxParticipants * 0.8 && (
                  <Text style={styles.warningText}>Filling up fast!</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <DollarSign size={20} color={COLORS.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Entry Fee</Text>
                <Text style={styles.infoValue}>${tournament.entryFee}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tournament Details</Text>
            <Text style={styles.description}>{tournament.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.tagContainer}>
              <View style={[styles.tag, styles.surfaceTag]}>
                <Text style={styles.tagText}>{tournament.surface}</Text>
              </View>
              {tournament.ageGroups.map(age => (
                <View key={age} style={styles.tag}>
                  <Text style={styles.tagText}>{age}</Text>
                </View>
              ))}
              {tournament.skillLevels.map(skill => (
                <View key={skill} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.chatButton} onPress={handleJoinChat}>
              <MessageCircle size={20} color={COLORS.surface} />
              <Text style={styles.chatButtonText}>Join Tournament Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register Now</Text>
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    flex: 1,
    marginRight: 16,
  },
  saveButton: {
    padding: 8,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  infoSubvalue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  surfaceTag: {
    backgroundColor: COLORS.primaryDark,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  chatButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  registerButton: {
    backgroundColor: COLORS.primaryDark,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});