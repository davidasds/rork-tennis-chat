import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      
      if (storedUser && storedToken) {
        return JSON.parse(storedUser) as User;
      }
      return null;
    }
  });

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Mock authentication - in production, this would call an API
      const mockUser: User = {
        id: 'u1',
        email,
        name: email.split('@')[0],
        utr: 6.5,
        preferredSurfaces: ['Hard Court'],
        availability: ['Weekend Mornings', 'Weekday Evenings'],
        location: 'Los Angeles, CA',
        bio: 'Passionate tennis player looking for practice partners and tournaments.',
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('token', 'mock-jwt-token');
      
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      // Mock signup - in production, this would call an API
      const mockUser: User = {
        id: `u${Date.now()}`,
        email,
        name,
        preferredSurfaces: [],
        availability: [],
        location: '',
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('token', 'mock-jwt-token');
      
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  return {
    user,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!user,
    login: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    signup: async (email: string, password: string, name: string) => {
      await signupMutation.mutateAsync({ email, password, name });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    updateProfile: async (updates: Partial<User>) => {
      await updateProfileMutation.mutateAsync(updates);
    }
  };
});