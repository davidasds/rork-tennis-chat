import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tournament } from '@/types';
import { mockTournaments, fetchUSTATournaments } from '@/mocks/tournaments';

interface TournamentFilters {
  location: string;
  ageGroup: string;
  skillLevel: string;
  surface: string;
  dateRange: { start: Date | null; end: Date | null };
}

interface TournamentsState {
  tournaments: Tournament[];
  savedTournamentIds: string[];
  filters: TournamentFilters;
  filteredTournaments: Tournament[];
  isLoading: boolean;
  setFilters: (filters: Partial<TournamentFilters>) => void;
  saveTournament: (tournamentId: string) => Promise<void>;
  unsaveTournament: (tournamentId: string) => Promise<void>;
  isTournamentSaved: (tournamentId: string) => boolean;
}

export const [TournamentsProvider, useTournaments] = createContextHook<TournamentsState>(() => {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [savedTournamentIds, setSavedTournamentIds] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<TournamentFilters>({
    location: '',
    ageGroup: '',
    skillLevel: '',
    surface: '',
    dateRange: { start: null, end: null }
  });
  
  const queryClient = useQueryClient();

  // Query for fetching tournaments (simulates real API)
  const tournamentsQuery = useQuery({
    queryKey: ['usta-tournaments'],
    queryFn: fetchUSTATournaments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (tournamentsQuery.data) {
      setTournaments(tournamentsQuery.data);
    }
  }, [tournamentsQuery.data]);

  const savedQuery = useQuery({
    queryKey: ['savedTournaments'],
    queryFn: async () => {
      const saved = await AsyncStorage.getItem('savedTournaments');
      return saved ? JSON.parse(saved) : [];
    }
  });

  useEffect(() => {
    if (savedQuery.data) {
      setSavedTournamentIds(savedQuery.data);
    }
  }, [savedQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const updated = [...savedTournamentIds, tournamentId];
      await AsyncStorage.setItem('savedTournaments', JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      setSavedTournamentIds(data);
      queryClient.invalidateQueries({ queryKey: ['savedTournaments'] });
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const updated = savedTournamentIds.filter(id => id !== tournamentId);
      await AsyncStorage.setItem('savedTournaments', JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      setSavedTournamentIds(data);
      queryClient.invalidateQueries({ queryKey: ['savedTournaments'] });
    }
  });

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      if (filters.location && !tournament.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.ageGroup && !tournament.ageGroups.includes(filters.ageGroup)) {
        return false;
      }
      if (filters.skillLevel && !tournament.skillLevels.includes(filters.skillLevel)) {
        return false;
      }
      if (filters.surface && tournament.surface !== filters.surface) {
        return false;
      }
      if (filters.dateRange.start && new Date(tournament.startDate) < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && new Date(tournament.endDate) > filters.dateRange.end) {
        return false;
      }
      return true;
    });
  }, [tournaments, filters]);

  const setFilters = useCallback((newFilters: Partial<TournamentFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const { mutateAsync: saveMutateAsync } = saveMutation;
  const { mutateAsync: unsaveMutateAsync } = unsaveMutation;

  const saveTournament = useCallback(async (tournamentId: string) => {
    if (!savedTournamentIds.includes(tournamentId)) {
      await saveMutateAsync(tournamentId);
    }
  }, [savedTournamentIds, saveMutateAsync]);

  const unsaveTournament = useCallback(async (tournamentId: string) => {
    await unsaveMutateAsync(tournamentId);
  }, [unsaveMutateAsync]);

  const isTournamentSaved = useCallback((tournamentId: string) => {
    return savedTournamentIds.includes(tournamentId);
  }, [savedTournamentIds]);

  return useMemo(() => ({
    tournaments,
    savedTournamentIds,
    filters,
    filteredTournaments,
    isLoading: savedQuery.isLoading || tournamentsQuery.isLoading,
    setFilters,
    saveTournament,
    unsaveTournament,
    isTournamentSaved
  }), [
    tournaments,
    savedTournamentIds,
    filters,
    filteredTournaments,
    savedQuery.isLoading,
    tournamentsQuery.isLoading,
    setFilters,
    saveTournament,
    unsaveTournament,
    isTournamentSaved
  ]);
});