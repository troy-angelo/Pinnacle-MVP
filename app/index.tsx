import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/constants/theme';

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 40 }}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="trending-up" size={32} color="#fff" />
          </View>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: 4 }}>PINNACLE</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Image
            source={{ uri: 'https://cdn.shipper.now/image/users/cmjd6nr540001l104hue4y69r/1779973800133-bsrhb34az7q-hero-runner.webp' }}
            style={{ width: 280, height: 280, borderRadius: 24 }}
            resizeMode="cover"
          />
        </View>

        <View>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, lineHeight: 34 }}>
            Train smarter.{'\n'}Recover faster.
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 16 }}>
            Connect with elite running coaches and licensed sports PTs—on demand or on schedule.
          </Text>

          <Pressable
            onPress={() => router.push('/onboarding/name')}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 32,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          <Pressable onPress={() => router.push('/(tabs)/dashboard')} style={{ paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>I already have an account</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
