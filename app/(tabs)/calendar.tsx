import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile } from '../../src/lib/onboarding-store';

export default function CalendarTab() {
  const profile = useAthleteProfile();
  const sorted = [...profile.races].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Calendar</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Races, sessions and milestones</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {sorted.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 12 }}>No events yet</Text>
          </View>
        ) : (
          sorted.map((r) => (
            <View key={r.id} style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 56, alignItems: 'center', backgroundColor: 'rgba(14,158,142,0.15)', borderRadius: 12, paddingVertical: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{new Date(r.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>{new Date(r.date).getDate()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{r.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Race day{r.distance ? ` • ${r.distance}` : ''}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
