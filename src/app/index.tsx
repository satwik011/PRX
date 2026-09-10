import { Link } from 'expo-router';
import { Text, View } from 'react-native';

/** Placeholder until Phase 2 builds the real Today screen. */
export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-screen">
      <Text className="mb-1.5 font-heading text-h2 text-foreground">PRX</Text>
      <Text className="mb-6 text-sm text-muted-foreground">
        Offline-first gym tracker
      </Text>
      <Link href="/tokens" asChild>
        <Text className="rounded-md border border-primary px-3 py-1.5 font-heading text-[14px] text-primary">
          Token reference
        </Text>
      </Link>
    </View>
  );
}
