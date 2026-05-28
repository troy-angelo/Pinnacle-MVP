import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/theme';
import { onboardingStore } from '../../src/lib/onboarding-store';
import { ProgressBar, Field, Footer } from './name';

export default function BirthdayScreen() {
  const router = useRouter();
  const [m, setM] = useState('');
  const [d, setD] = useState('');
  const [y, setY] = useState('');

  const valid = /^\d{1,2}$/.test(m) && +m >= 1 && +m <= 12 && /^\d{1,2}$/.test(d) && +d >= 1 && +d <= 31 && /^\d{4}$/.test(y) && +y >= 1900 && +y <= new Date().getFullYear();

  const next = () => {
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    onboardingStore.update({ birthday: iso });
    router.push('/onboarding/profile-setup' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ProgressBar step={2} total={5} />
        <View style={{ paddingHorizontal: 24, flex: 1, paddingTop: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>STEP 2 OF 5</Text>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>When were you born?</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 32, lineHeight: 22 }}>We use this to personalize training zones and recovery metrics.</Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Month" value={m} onChange={setM} placeholder="MM" /></View>
            <View style={{ flex: 1 }}><Field label="Day" value={d} onChange={setD} placeholder="DD" /></View>
            <View style={{ flex: 1.3 }}><Field label="Year" value={y} onChange={setY} placeholder="YYYY" /></View>
          </View>
        </View>
        <Footer onNext={next} disabled={!valid} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
