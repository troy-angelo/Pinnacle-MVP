import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { onboardingStore } from '../../src/lib/onboarding-store';

export default function NameScreen() {
  const router = useRouter();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  const next = () => {
    onboardingStore.update({ firstName: first.trim(), lastName: last.trim() });
    router.push('/onboarding/birthday' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ProgressBar step={1} total={5} />
        <View style={{ paddingHorizontal: 24, flex: 1, paddingTop: 16 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>STEP 1 OF 5</Text>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>{"What's your name?"}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 32, lineHeight: 22 }}>{"Tell us how you'd like coaches to address you."}</Text>

          <Field label="First name" value={first} onChange={setFirst} placeholder="e.g. Sarah" />
          <View style={{ height: 16 }} />
          <Field label="Last name" value={last} onChange={setLast} placeholder="e.g. Mitchell" />
        </View>
        <Footer onNext={next} disabled={!first.trim() || !last.trim()} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
      <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ width: `${(step / total) * 100}%`, height: '100%', backgroundColor: colors.primary }} />
      </View>
    </View>
  );
}

export function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View>
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 }}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={{
          backgroundColor: colors.bgCard,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: colors.text,
          fontSize: 16,
        }}
      />
    </View>
  );
}

export function Footer({ onNext, disabled, label = 'Continue' }: { onNext: () => void; disabled?: boolean; label?: string }) {
  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 }}>
      <Pressable
        onPress={onNext}
        disabled={disabled}
        style={({ pressed }) => ({
          backgroundColor: disabled ? colors.bgCard : colors.primary,
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ color: disabled ? colors.textTertiary : '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
        {!disabled && <Ionicons name="arrow-forward" size={18} color="#fff" />}
      </Pressable>
    </View>
  );
}
