import { ScrollView, Text, View } from 'react-native';

/**
 * DEV-ONLY token reference at /tokens.
 *
 * Started life as the Phase 0 spike that proved Uniwind renders Nocturne on
 * Expo SDK 57. Kept because every block maps to an item on the gotcha list in
 * .claude/rules/tokens.md — when a real component looks wrong, compare it here.
 *
 * Not linked from any shipping screen. Delete before the first release build.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-card-gap">
      <Text className="mb-1 font-heading text-micro uppercase tracking-[0.1em] text-primary">
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function TokenReference() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-screen pt-screen-top pb-8">
      {/* eyebrow + screen title — gotcha #11 */}
      <Text className="mb-0.5 text-meta uppercase tracking-[0.08em] text-subtle">
        Tuesday, 10 September
      </Text>
      <Text className="mb-6 font-heading text-h2 text-foreground">Token reference</Text>

      {/* #1 card is a hairline, NOT a shadow — #12 display numeral */}
      <Row label="Streak card · hairline + 44px numeral">
        <View className="items-center gap-1.5 rounded-md border border-muted bg-card px-4 py-6">
          <View className="h-8 w-8 rounded-pill bg-primary" />
          <Text className="font-heading text-display leading-none text-foreground">12</Text>
          <Text className="text-sm text-muted-foreground">day streak · best 21</Text>
        </View>
      </Row>

      {/* #9 progress track is muted, fill is primary, both pill */}
      <Row label="Progress · muted track, primary fill">
        <View className="gap-2.5 rounded-md border border-muted bg-card p-2">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-heading text-card-title text-foreground">Today</Text>
            <Text className="font-heading text-h4 text-primary">72%</Text>
          </View>
          <View className="h-2 overflow-hidden rounded-pill bg-track">
            <View className="h-full w-[72%] rounded-pill bg-primary" />
          </View>
        </View>
      </Row>

      {/* #2 primary is OUTLINED, not filled */}
      <Row label="Buttons · primary is outlined, not filled">
        <View className="gap-2">
          <View className="items-center justify-center rounded-md border border-primary px-3 py-1.5">
            <Text className="font-heading text-[14px] text-primary">Open today's tasks</Text>
          </View>
          <View className="items-center justify-center rounded-md border border-line px-3 py-1.5">
            <Text className="font-heading text-[14px] text-foreground">Add task</Text>
          </View>
          <View className="items-center justify-center px-1 py-1.5">
            <Text className="font-heading text-[14px] text-primary">Log out</Text>
          </View>
        </View>
      </Row>

      {/* #7 partial is amber, never green/red */}
      <Row label="Day states · hit / partial / missed">
        <View className="flex-row gap-1">
          <View className="h-9 flex-1 items-center justify-center rounded-sm bg-primary">
            <Text className="font-strong text-micro text-primary-foreground">8</Text>
          </View>
          <View className="h-9 flex-1 items-center justify-center rounded-sm bg-warning">
            <Text className="font-strong text-micro text-warning-foreground">9</Text>
          </View>
          <View className="h-9 flex-1 items-center justify-center rounded-sm bg-muted">
            <Text className="text-micro text-subtle">10</Text>
          </View>
          <View className="h-9 flex-1 items-center justify-center rounded-sm border-[1.5px] border-primary bg-muted">
            <Text className="text-micro text-subtle">11</Text>
          </View>
        </View>
      </Row>

      {/* #8 three distinct muted weights must be visibly different */}
      <Row label="Muted ladder · three distinct greys">
        <View className="gap-1 rounded-md border border-muted bg-card p-2">
          <Text className="text-body text-foreground">foreground — task name</Text>
          <Text className="text-sm text-muted-foreground">muted — card description</Text>
          <Text className="text-meta text-subtle">subtle — best 80 kg</Text>
          <Text className="text-micro text-faint">faint — tab label</Text>
        </View>
      </Row>

      <Row label="Tag · New PR">
        <View className="flex-row">
          <View className="rounded-[6px] bg-tag-bg px-2.5 py-0.5">
            <Text className="text-meta text-tag-fg">New PR</Text>
          </View>
        </View>
      </Row>

      <Text className="mt-4 text-meta text-faint">
        Every block above maps to an item on the gotcha list in tokens.md.
      </Text>
    </ScrollView>
  );
}
