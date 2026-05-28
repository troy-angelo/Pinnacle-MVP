import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile } from '../../src/lib/onboarding-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const profile = useAthleteProfile();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 40 }}>
        <View />
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(14,158,142,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          </View>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, marginBottom: 12 }}>
            {"You're all set,"}{'\n'}{profile.firstName || 'Athlete'}!
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 }}>
            Your training hub is ready. Connect with coaches and PTs whenever you need them.
          </Text>
        </View>
        <Pressable
          onPress={() => router.replace('/(tabs)/dashboard')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Enter your dashboard</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
