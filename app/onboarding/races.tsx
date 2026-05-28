import { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { onboardingStore, useAthleteProfile } from '../../src/lib/onboarding-store';
import { ProgressBar, Field, Footer } from './name';

const DISTANCES = ['5K', '10K', 'Half', 'Marathon', 'Ultra'];

export default function RacesScreen() {
  const router = useRouter();
  const profile = useAthleteProfile();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [m, setM] = useState('');
  const [d, setD] = useState('');
  const [y, setY] = useState('');
  const [distance, setDistance] = useState<string | undefined>();

  const validRace = name.trim() && /^\d{1,2}$/.test(m) && /^\d{1,2}$/.test(d) && /^\d{4}$/.test(y);

  const saveRace = () => {
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    onboardingStore.addRace({ id: Date.now().toString(), name: name.trim(), date: iso, distance });
    setName(''); setM(''); setD(''); setY(''); setDistance(undefined); setAdding(false);
  };

  const finish = () => router.push('/onboarding/welcome');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ProgressBar step={5} total={5} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>STEP 5 OF 5</Text>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>Upcoming races</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 24, lineHeight: 22 }}>{"We'll add them to your calendar and build your countdown."}</Text>

          {profile.races.map((r) => (
            <View key={r.id} style={{ backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(14,158,142,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flag" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{r.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {r.distance ? ` • ${r.distance}` : ''}
                </Text>
              </View>
            </View>
          ))}

          {adding ? (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginTop: 8 }}>
              <Field label="Race name" value={name} onChange={setName} placeholder="e.g. Boston Marathon" />
              <View style={{ height: 14 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 }}>RACE DATE</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Field label="" value={m} onChange={setM} placeholder="MM" /></View>
                <View style={{ flex: 1 }}><Field label="" value={d} onChange={setD} placeholder="DD" /></View>
                <View style={{ flex: 1.3 }}><Field label="" value={y} onChange={setY} placeholder="YYYY" /></View>
              </View>
              <View style={{ height: 14 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 }}>DISTANCE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DISTANCES.map((d2) => {
                  const sel = distance === d2;
                  return (
                    <Pressable key={d2} onPress={() => setDistance(d2)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: sel ? colors.primary : colors.bgCardElevated, borderWidth: 1, borderColor: sel ? colors.primary : colors.border }}>
                      <Text style={{ color: sel ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{d2}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                <Pressable onPress={() => setAdding(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: colors.bgCardElevated }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveRace} disabled={!validRace} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: validRace ? colors.primary : colors.bgCardElevated }}>
                  <Text style={{ color: validRace ? '#fff' : colors.textTertiary, fontSize: 14, fontWeight: '700' }}>Save race</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setAdding(true)} style={{ marginTop: 8, paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border }}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Add a race</Text>
            </Pressable>
          )}
        </ScrollView>
        <Footer onNext={finish} label={profile.races.length > 0 ? 'Finish' : 'Skip'} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
