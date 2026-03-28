import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { router } from 'expo-router';
import { Search, Filter, MapPin, Calendar, Users, DollarSign, X, ChevronDown } from 'lucide-react-native';
import { useTournaments } from '@/hooks/tournaments-context';
import { useAuth } from '@/hooks/auth-context';
import { COLORS, SURFACES, AGE_GROUPS, SKILL_LEVELS } from '@/constants/tennis';
import { Tournament } from '@/types';

export default function TournamentsScreen() {
  const { filteredTournaments, filters, setFilters, isLoading } = useTournaments();
  const { isAuthenticated } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Only update location filter if it's not a price filter
    if (!filters.location.includes('$')) {
      setFilters({ location: text });
    } else {
      // Preserve price filter and add location search
      const priceFilter = filters.location.match(/\$[^\s]+/)?.[0] || '';
      setFilters({ location: text ? `${text} ${priceFilter}`.trim() : priceFilter });
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      location: '',
      ageGroup: '',
      skillLevel: '',
      surface: '',
      dateRange: { start: null, end: null }
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setSearchText('');
  };

  const applyAdvancedFilters = () => {
    setFilters(tempFilters);
    setShowAdvancedFilters(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location && !filters.location.includes('$')) count++;
    if (filters.location && filters.location.includes('$')) count++; // Price filter
    if (filters.ageGroup) count++;
    if (filters.skillLevel) count++;
    if (filters.surface) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTournamentCard = (tournament: Tournament) => (
    <TouchableOpacity
      key={tournament.id}
      style={styles.card}
      onPress={() => {
        if (!isAuthenticated) {
          router.push('/auth');
        } else {
          router.push(`/tournament/${tournament.id}`);
        }
      }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: tournament.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{tournament.name}</Text>
        
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{tournament.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {tournament.currentParticipants}/{tournament.maxParticipants} players
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <DollarSign size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>${tournament.entryFee}</Text>
          </View>
        </View>

        <View style={styles.cardTags}>
          <View style={[styles.tag, styles.surfaceTag]}>
            <Text style={styles.tagText}>{tournament.surface}</Text>
          </View>
          {tournament.ageGroups.slice(0, 2).map(age => (
            <View key={age} style={styles.tag}>
              <Text style={styles.tagText}>{age}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.deadlineText}>
            Register by {formatDate(tournament.registrationDeadline)}
          </Text>
          {tournament.currentParticipants >= tournament.maxParticipants * 0.8 && (
            <View style={styles.fillingFast}>
              <Text style={styles.fillingFastText}>Filling Fast!</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={COLORS.surface} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.quickFiltersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity 
              style={[styles.filterChip, !filters.surface && styles.filterChipActive]}
              onPress={() => setFilters({ surface: '' })}
            >
              <Text style={[styles.filterChipText, !filters.surface && styles.filterChipTextActive]}>All Surfaces</Text>
            </TouchableOpacity>
            {SURFACES.map(surface => (
              <TouchableOpacity 
                key={surface}
                style={[
                  styles.filterChip,
                  filters.surface === surface && styles.filterChipActive
                ]}
                onPress={() => setFilters({ surface })}
              >
                <Text style={[styles.filterChipText, filters.surface === surface && styles.filterChipTextActive]}>{surface}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.advancedFilterButton}
              onPress={() => {
                setTempFilters(filters);
                setShowAdvancedFilters(true);
              }}
            >
              <Text style={styles.advancedFilterText}>Advanced</Text>
              <ChevronDown size={16} color={COLORS.secondary} />
            </TouchableOpacity>
            
            {getActiveFilterCount() > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearFiltersText}>Clear ({getActiveFilterCount()})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.secondary}
          />
        }
      >
        {filteredTournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tournaments found</Text>
            <Text style={styles.emptyStateSubtext}>
              {getActiveFilterCount() > 0 
                ? 'Try adjusting your filters or clear them to see all tournaments'
                : 'Check back later for new tournaments'
              }
            </Text>
            {getActiveFilterCount() > 0 && (
              <TouchableOpacity style={styles.clearFiltersEmptyButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersEmptyText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                  {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
                </Text>
                {getActiveFilterCount() > 0 && (
                  <Text style={styles.filtersAppliedText}>
                    {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
                  </Text>
                )}
                <Text style={styles.lastUpdatedText}>Last updated: Just now</Text>
              </View>
              <View style={styles.sourceBadges}>
                <View style={styles.tournamentSourceBadge}>
                  <Text style={styles.tournamentSourceText}>USTA</Text>
                </View>
                <View style={[styles.tournamentSourceBadge, { backgroundColor: COLORS.accent }]}>
                  <Text style={[styles.tournamentSourceText, { color: COLORS.text }]}>ITF</Text>
                </View>
                <View style={[styles.tournamentSourceBadge, { backgroundColor: COLORS.primaryDark }]}>
                  <Text style={styles.tournamentSourceText}>UTR</Text>
                </View>
              </View>
            </View>
            {filteredTournaments.map(renderTournamentCard)}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showAdvancedFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAdvancedFilters(false)}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Age Group</Text>
              <View style={styles.filterGrid}>
                <TouchableOpacity 
                  style={[styles.filterGridItem, !tempFilters.ageGroup && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, ageGroup: '' }))}
                >
                  <Text style={[styles.filterGridText, !tempFilters.ageGroup && styles.filterGridTextActive]}>All Ages</Text>
                </TouchableOpacity>
                {AGE_GROUPS.map(age => (
                  <TouchableOpacity 
                    key={age}
                    style={[
                      styles.filterGridItem,
                      tempFilters.ageGroup === age && styles.filterGridItemActive
                    ]}
                    onPress={() => setTempFilters(prev => ({ ...prev, ageGroup: age }))}
                  >
                    <Text style={[styles.filterGridText, tempFilters.ageGroup === age && styles.filterGridTextActive]}>{age}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Skill Level</Text>
              <View style={styles.filterGrid}>
                <TouchableOpacity 
                  style={[styles.filterGridItem, !tempFilters.skillLevel && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, skillLevel: '' }))}
                >
                  <Text style={[styles.filterGridText, !tempFilters.skillLevel && styles.filterGridTextActive]}>All Levels</Text>
                </TouchableOpacity>
                {SKILL_LEVELS.map(level => (
                  <TouchableOpacity 
                    key={level}
                    style={[
                      styles.filterGridItem,
                      tempFilters.skillLevel === level && styles.filterGridItemActive
                    ]}
                    onPress={() => setTempFilters(prev => ({ ...prev, skillLevel: level }))}
                  >
                    <Text style={[styles.filterGridText, tempFilters.skillLevel === level && styles.filterGridTextActive]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Court Surface</Text>
              <View style={styles.filterGrid}>
                <TouchableOpacity 
                  style={[styles.filterGridItem, !tempFilters.surface && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, surface: '' }))}
                >
                  <Text style={[styles.filterGridText, !tempFilters.surface && styles.filterGridTextActive]}>All Surfaces</Text>
                </TouchableOpacity>
                {SURFACES.map(surface => (
                  <TouchableOpacity 
                    key={surface}
                    style={[
                      styles.filterGridItem,
                      tempFilters.surface === surface && styles.filterGridItemActive
                    ]}
                    onPress={() => setTempFilters(prev => ({ ...prev, surface }))}
                  >
                    <Text style={[styles.filterGridText, tempFilters.surface === surface && styles.filterGridTextActive]}>{surface}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Entry Fee Range</Text>
              <View style={styles.filterGrid}>
                <TouchableOpacity 
                  style={[styles.filterGridItem, !tempFilters.location.includes('$') && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, location: prev.location.replace(/\$\d+-\$\d+/g, '').trim() }))}
                >
                  <Text style={[styles.filterGridText, !tempFilters.location.includes('$') && styles.filterGridTextActive]}>Any Price</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterGridItem, tempFilters.location.includes('$0-$100') && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, location: '$0-$100' }))}
                >
                  <Text style={[styles.filterGridText, tempFilters.location.includes('$0-$100') && styles.filterGridTextActive]}>Under $100</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterGridItem, tempFilters.location.includes('$100-$200') && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, location: '$100-$200' }))}
                >
                  <Text style={[styles.filterGridText, tempFilters.location.includes('$100-$200') && styles.filterGridTextActive]}>$100-$200</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterGridItem, tempFilters.location.includes('$200+') && styles.filterGridItemActive]}
                  onPress={() => setTempFilters(prev => ({ ...prev, location: '$200+' }))}
                >
                  <Text style={[styles.filterGridText, tempFilters.location.includes('$200+') && styles.filterGridTextActive]}>$200+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalClearButton}
              onPress={() => {
                const clearedFilters = {
                  location: tempFilters.location,
                  ageGroup: '',
                  skillLevel: '',
                  surface: '',
                  dateRange: { start: null, end: null }
                };
                setTempFilters(clearedFilters);
              }}
            >
              <Text style={styles.modalClearText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalApplyButton}
              onPress={applyAdvancedFilters}
            >
              <Text style={styles.modalApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 48,
    minHeight: 48,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  filterScroll: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickFiltersContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.surface,
    fontWeight: '600' as const,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  advancedFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  advancedFilterText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginRight: 4,
    fontWeight: '500' as const,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '500' as const,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsInfo: {
    flex: 1,
  },
  sourceBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  filtersAppliedText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  tournamentSourceBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tournamentSourceText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '600' as const,
  },
  clearFiltersEmptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  clearFiltersEmptyText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterGridItem: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterGridItemActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterGridText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterGridTextActive: {
    color: COLORS.surface,
    fontWeight: '600' as const,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalClearButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalClearText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600' as const,
  },
  modalApplyButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalApplyText: {
    fontSize: 16,
    color: COLORS.surface,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  cardInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  surfaceTag: {
    backgroundColor: COLORS.primaryDark,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  fillingFast: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fillingFastText: {
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});