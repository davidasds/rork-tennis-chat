import { Stack } from "expo-router";
import { COLORS } from "@/constants/tennis";

export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.secondary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' as const }
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Tournament Calendar"
        }} 
      />
    </Stack>
  );
}