import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { useSession } from '../services/auth';
import { getAthleteProfile, isOnboardingComplete } from '../services/storage';
import { colors } from '../src/constants/theme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const [hydrating, setHydrating] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Hydrate persisted athlete profile + onboarding flag once on boot
  useEffect(() => {
    let mounted = true;
    (async () => {
      await getAthleteProfile();
      const done = await isOnboardingComplete();
      if (mounted) {
        setOnboardingDone(done);
        setHydrating(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Route guard — redirect based on session + onboarding state
  useEffect(() => {
    if (loading || hydrating) return;
    const first = segments[0];
    const inTabs = first === '(tabs)';
    const inOnboarding = first === 'onboarding';

    if (session && onboardingDone && !inTabs) {
      router.replace('/(tabs)/dashboard');
    } else if (session && !onboardingDone && !inOnboarding) {
      router.replace('/onboarding/name');
    } else if (!session && (inTabs || inOnboarding)) {
      router.replace('/');
    }
  }, [session, onboardingDone, loading, hydrating, segments, router]);

  if (loading || hydrating) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider
      initialMetrics={{
        insets: { top: 47, bottom: 34, left: 0, right: 0 },
        frame: { x: 0, y: 0, width: 393, height: 852 },
      }}
    >
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0E11' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="onboarding"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGate>
    </SafeAreaProvider>
  );
}
