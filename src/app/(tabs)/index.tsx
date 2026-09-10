import { Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/app/screen-header';
import { SectionCard } from '@/components/app/section-card';
import { StatCard } from '@/components/app/stat-card';
import { WeekBarChart, type WeekDay } from '@/components/app/week-bar-chart';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useHistory } from '@/hooks/use-history';
import { QUOTES } from '@/lib/content/quotes';
import { colors } from '@/theme/tokens';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function quoteOfDay() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function Dashboard() {
  const { ready, settings, summaries, streaks, todayKey } = useHistory(90);

  if (!ready) return <View className="flex-1 bg-background" />;

  const today = summaries[summaries.length - 1];
  const percent = Math.round(today?.percent ?? 0);

  const week: WeekDay[] = summaries.slice(-7).map((s) => {
    const [y, m, d] = s.day.split('-').map(Number);
    return {
      label: s.day === todayKey ? 'Today' : DOW[new Date(y, m - 1, d).getDay()],
      percent: Math.round(s.percent),
      isToday: s.day === todayKey,
    };
  });

  const now = new Date();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      <ScreenHeader
        eyebrow={`${DOW[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`}
        title="Welcome back"
      />
      <Text className="mb-4 text-sm italic text-muted-foreground">“{quoteOfDay()}”</Text>

      <View className="mb-card-gap">
        <StatCard
          icon={<Flame size={34} color={colors.primary} strokeWidth={1.5} />}
          value={streaks.current}
          caption={`day streak · best ${streaks.best}`}
        />
      </View>

      <SectionCard
        className="mb-card-gap"
        title="Today"
        trailing={<Text className="font-heading text-h4 text-primary">{percent}%</Text>}>
        <ProgressBar percent={percent} height={8} />
        <Text className="text-sm text-muted-foreground">
          {percent >= settings.streakThreshold
            ? 'Goal hit — streak safe.'
            : percent > 0
              ? `${settings.streakThreshold - percent}% to go for today.`
              : 'Nothing logged yet today.'}
        </Text>
        <Button
          full
          variant="primary"
          label="Open today's tasks"
          onPress={() => router.push('/today')}
        />
      </SectionCard>

      <SectionCard title="This week">
        <WeekBarChart days={week} threshold={settings.streakThreshold} />
      </SectionCard>
    </ScrollView>
  );
}
