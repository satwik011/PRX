import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import migrations from '../../drizzle/migrations';
import { db } from '@/db/client';
import { seedTemplatesIfEmpty } from '@/lib/repo';

SplashScreen.preventAutoHideAsync();

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-screen">{children}</View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) void seedTemplatesIfEmpty();
  }, [success]);

  useEffect(() => {
    if (fontsLoaded && (success || error)) void SplashScreen.hideAsync();
  }, [fontsLoaded, success, error]);

  if (error) {
    return (
      <Centered>
        <Text className="mb-1.5 font-heading text-h4 text-destructive">Migration failed</Text>
        <Text className="text-center text-sm text-muted-foreground">{error.message}</Text>
      </Centered>
    );
  }

  if (!fontsLoaded || !success) return null;

  // Dark only — Nocturne has no light palette.
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#161826' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tokens" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
