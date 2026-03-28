import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/auth-context";
import { TournamentsProvider } from "@/hooks/tournaments-context";
import { ChatProvider } from "@/hooks/chat-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen 
        name="tournament/[id]" 
        options={{ 
          title: "Tournament Details",
          headerStyle: { backgroundColor: '#2E7D32' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          title: "Chat",
          headerStyle: { backgroundColor: '#2E7D32' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TournamentsProvider>
          <ChatProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ChatProvider>
        </TournamentsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}