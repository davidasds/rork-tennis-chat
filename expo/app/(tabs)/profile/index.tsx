import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { User, MapPin, Trophy, Calendar, Edit2, LogOut, Save } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { COLORS, SURFACES, AVAILABILITY } from '@/constants/tennis';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    location: user?.location || '',
    bio: user?.bio || '',
    utr: user?.utr?.toString() || '',
    preferredSurfaces: user?.preferredSurfaces || [],
    availability: user?.availability || []
  });

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <User size={64} color={COLORS.textSecondary} />
          <Text style={styles.loginTitle}>Create Your Profile</Text>
          <Text style={styles.loginSubtitle}>
            Join to connect with tennis players in your area
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

  const handleSave = async () => {
    await updateProfile({
      ...editedProfile,
      utr: editedProfile.utr ? parseFloat(editedProfile.utr) : undefined
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const toggleSurface = (surface: string) => {
    setEditedProfile(prev => ({
      ...prev,
      preferredSurfaces: prev.preferredSurfaces.includes(surface)
        ? prev.preferredSurfaces.filter(s => s !== surface)
        : [...prev.preferredSurfaces, surface]
    }));
  };

  const toggleAvailability = (time: string) => {
    setEditedProfile(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(a => a !== time)
        : [...prev.availability, time]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {isEditing ? (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={20} color={COLORS.surface} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={16} color={COLORS.text} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
              placeholder="Your name"
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <MapPin size={16} color={COLORS.textSecondary} />
            <Text style={styles.label}>Location</Text>
          </View>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.location}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
              placeholder="City, State"
            />
          ) : (
            <Text style={styles.value}>{user.location || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Trophy size={16} color={COLORS.textSecondary} />
            <Text style={styles.label}>UTR Rating</Text>
          </View>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedProfile.utr}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, utr: text }))}
              placeholder="e.g., 7.5"
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.value}>{user.utr || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about your tennis journey..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{user.bio || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Surfaces</Text>
          {isEditing ? (
            <View style={styles.chipContainer}>
              {SURFACES.map(surface => (
                <TouchableOpacity
                  key={surface}
                  style={[
                    styles.chip,
                    editedProfile.preferredSurfaces.includes(surface) && styles.chipSelected
                  ]}
                  onPress={() => toggleSurface(surface)}
                >
                  <Text style={[
                    styles.chipText,
                    editedProfile.preferredSurfaces.includes(surface) && styles.chipTextSelected
                  ]}>
                    {surface}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.chipContainer}>
              {user.preferredSurfaces.length > 0 ? (
                user.preferredSurfaces.map(surface => (
                  <View key={surface} style={styles.chipSelected}>
                    <Text style={styles.chipTextSelected}>{surface}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.value}>Not set</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Calendar size={16} color={COLORS.textSecondary} />
            <Text style={styles.label}>Availability</Text>
          </View>
          {isEditing ? (
            <View style={styles.chipContainer}>
              {AVAILABILITY.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.chip,
                    editedProfile.availability.includes(time) && styles.chipSelected
                  ]}
                  onPress={() => toggleAvailability(time)}
                >
                  <Text style={[
                    styles.chipText,
                    editedProfile.availability.includes(time) && styles.chipTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.chipContainer}>
              {user.availability.length > 0 ? (
                user.availability.map(time => (
                  <View key={time} style={styles.chipSelected}>
                    <Text style={styles.chipTextSelected}>{time}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.value}>Not set</Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '600' as const,
  },
  section: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.surface,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600' as const,
  },
});