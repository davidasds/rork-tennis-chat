import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react-native';
import { useTournaments } from '@/hooks/tournaments-context';
import { useAuth } from '@/hooks/auth-context';
import { COLORS } from '@/constants/tennis';
import { Tournament } from '@/types';

export default function CalendarScreen() {
  const { tournaments, savedTournamentIds } = useTournaments();
  const { isAuthenticated } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + increment);
      return newDate;
    });
  };

  const getTournamentsForDate = (day: number): Tournament[] => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return tournaments.filter(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return date >= start && date <= end;
    });
  };

  const getSavedTournamentsForMonth = (): Tournament[] => {
    return tournaments.filter(t => {
      const start = new Date(t.startDate);
      return start.getMonth() === currentMonth.getMonth() && 
             start.getFullYear() === currentMonth.getFullYear() &&
             savedTournamentIds.includes(t.id);
    });
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const tournamentsOnDay = getTournamentsForDate(day);
      const hasTournaments = tournamentsOnDay.length > 0;
      const hasSaved = tournamentsOnDay.some(t => savedTournamentIds.includes(t.id));
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            hasTournaments && styles.dayWithEvent,
            hasSaved && styles.dayWithSavedEvent
          ]}
          onPress={() => {
            if (hasTournaments && isAuthenticated) {
              router.push(`/tournament/${tournamentsOnDay[0].id}`);
            }
          }}
        >
          <Text style={[
            styles.dayText,
            hasTournaments && styles.dayTextWithEvent
          ]}>
            {day}
          </Text>
          {hasTournaments && (
            <View style={styles.eventIndicator}>
              <View style={[
                styles.eventDot,
                hasSaved && styles.savedEventDot
              ]} />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const savedTournamentsThisMonth = getSavedTournamentsForMonth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <ChevronRight size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendarGrid()}
      </View>

      <ScrollView style={styles.eventsList}>
        <Text style={styles.sectionTitle}>Your Tournaments This Month</Text>
        {!isAuthenticated ? (
          <TouchableOpacity 
            style={styles.loginPrompt}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginPromptText}>Login to save tournaments</Text>
          </TouchableOpacity>
        ) : savedTournamentsThisMonth.length === 0 ? (
          <Text style={styles.noEventsText}>No saved tournaments this month</Text>
        ) : (
          savedTournamentsThisMonth.map(tournament => (
            <TouchableOpacity
              key={tournament.id}
              style={styles.eventCard}
              onPress={() => router.push(`/tournament/${tournament.id}`)}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>
                  {new Date(tournament.startDate).getDate()}
                </Text>
                <Text style={styles.eventMonth}>
                  {monthNames[new Date(tournament.startDate).getMonth()].slice(0, 3)}
                </Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{tournament.name}</Text>
                <View style={styles.eventInfo}>
                  <MapPin size={14} color={COLORS.textSecondary} />
                  <Text style={styles.eventLocation}>{tournament.location}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Clock size={14} color={COLORS.textSecondary} />
                  <Text style={styles.eventDuration}>
                    {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surface,
    paddingBottom: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  dayWithEvent: {
    backgroundColor: COLORS.background,
  },
  dayWithSavedEvent: {
    backgroundColor: '#E8F5E9',
  },
  dayText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dayTextWithEvent: {
    fontWeight: 'bold' as const,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  savedEventDot: {
    backgroundColor: COLORS.primaryDark,
  },
  eventsList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 16,
  },
  loginPrompt: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginPromptText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  noEventsText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  eventMonth: {
    fontSize: 12,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  eventDuration: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});