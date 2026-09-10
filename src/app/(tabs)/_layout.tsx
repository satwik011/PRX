import { Tabs } from 'expo-router';
import { CalendarDays, Home, Settings, SquareCheckBig, Trophy } from 'lucide-react-native';

import { colors } from '@/theme/tokens';

const ICONS = { index: Home, today: SquareCheckBig, history: CalendarDays, prs: Trophy, settings: Settings };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        sceneStyle: { backgroundColor: colors.background },
        // No fixed height — react-navigation adds the home-indicator inset itself.
        // Pinning it to 68 clipped the labels on notched iPhones.
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'Inter_400Regular' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <ICONS.index size={22} color={color} strokeWidth={1.5} /> }}
      />
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ color }) => <ICONS.today size={22} color={color} strokeWidth={1.5} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color }) => <ICONS.history size={22} color={color} strokeWidth={1.5} /> }}
      />
      <Tabs.Screen
        name="prs"
        options={{ title: 'PRs', tabBarIcon: ({ color }) => <ICONS.prs size={22} color={color} strokeWidth={1.5} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <ICONS.settings size={22} color={color} strokeWidth={1.5} /> }}
      />
    </Tabs>
  );
}
