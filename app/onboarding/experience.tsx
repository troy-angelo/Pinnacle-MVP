import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { onboardingStore, ExperienceLevel, Goal } from '../../src/lib/onboarding-store';
import { ProgressBar, Footer } from './name';

const LEVELS: { id: ExperienceLevel; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'Beginner', desc: 'New to running or returning after a break', icon: 'leaf-outline' },
  { id: 'Recreational', desc: 'Run regularly for fitness and fun', icon: 'walk-outline' },
  { id: 'Competitive', desc: 'Train with race goals and structured plans', icon: 'flame-outline' },
];

const GOALS: { id: Goal; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'First race', icon: 'flag-outline' },
  { id: 'Hit a PR', icon: 'trophy-outline' },
  { id: 'General fitness', icon: 'fitness-outline' },
  { id: 'Injury recovery', icon: 'medkit-outline' },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const [level, setLevel] = useState<ExperienceLevel | undefined>();
  const [goal, setGoal] = useState<Goal | undefined>();

  const next = () => {
    onboardingStore.update({ experience: level, goal });
    router.push('/onboarding/races' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressBar step={4} total={5} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>STEP 4 OF 5</Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>About your training</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 24, lineHeight: 22 }}>{"We'll use this to match you with the right experts."}</Text>

        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 }}>EXPERIENCE LEVEL</Text>
        <View style={{ gap: 10, marginBottom: 28 }}>
          {LEVELS.map((l) => {
            const sel = level === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setLevel(l.id)}
                style={{
                  backgroundColor: sel ? 'rgba(14,158,142,0.12)' : colors.bgCard,
                  borderWidth: 1.5,
                  borderColor: sel ? colors.primary : colors.border,
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: sel ? colors.primary : colors.bgCardElevated, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={l.icon} size={20} color={sel ? '#fff' : colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>{l.id}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 16 }}>{l.desc}</Text>
                </View>
                {sel && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 }}>CURRENT GOAL</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {GOALS.map((g) => {
            const sel = goal === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => setGoal(g.id)}
                style={{
                  width: '48%',
                  backgroundColor: sel ? 'rgba(14,158,142,0.12)' : colors.bgCard,
                  borderWidth: 1.5,
                  borderColor: sel ? colors.primary : colors.border,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <Ionicons name={g.icon} size={22} color={sel ? colors.primary : colors.textSecondary} />
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{g.id}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Footer onNext={next} disabled={!level || !goal} />
    </SafeAreaView>
  );
}
