import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile, onboardingStore } from '../../src/lib/onboarding-store';
import { curateForAthlete, type Pro } from '../../src/lib/coach-service';

export default function Dashboard() {
  const profile = useAthleteProfile();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const nextRace = useMemo(() => {
    const upcoming = profile.races
      .map((r) => ({ ...r, ts: new Date(r.date).getTime() }))
      .filter((r) => r.ts >= Date.now() - 86400000)
      .sort((a, b) => a.ts - b.ts);
    return upcoming[0];
  }, [profile.races]);

  const daysUntil = nextRace ? Math.max(0, Math.ceil((new Date(nextRace.date).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Welcome back</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>{profile.firstName || 'Athlete'} 👋</Text>
        </View>
        <Pressable onPress={() => setMenuOpen(true)} style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: colors.primary }}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '800' }}>
                {(profile.firstName?.[0] ?? 'A') + (profile.lastName?.[0] ?? '')}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Connect Now hero */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Pressable
            style={({ pressed }) => ({
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: colors.primary,
              padding: 20,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ position: 'absolute', bottom: -40, right: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#7CFFB2' }} />
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>12 EXPERTS ONLINE</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 }}>Connect Now</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 18, lineHeight: 18, maxWidth: '85%' }}>
              Get instant video or chat with a coach or PT. Avg wait under 2 min.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flash" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>Start session</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Race countdown */}
        {nextRace ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/calendar' as any)}
              style={({ pressed }) => ({
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: '#0F172A',
                borderWidth: 1,
                borderColor: 'rgba(14,158,142,0.35)',
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <View style={{ position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(14,158,142,0.18)' }} />
              <View style={{ position: 'absolute', bottom: -30, left: -10, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(14,158,142,0.10)' }} />
              <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ width: 76, height: 76, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 30 }}>{daysUntil}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 }}>{daysUntil === 1 ? 'DAY' : 'DAYS'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="flag" size={11} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>NEXT RACE</Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 4 }} numberOfLines={1}>{nextRace.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                    {new Date(nextRace.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {nextRace.distance ? ` • ${nextRace.distance}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/calendar' as any)}
              style={({ pressed }) => ({
                borderRadius: 20,
                padding: 18,
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'dashed',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(14,158,142,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flag-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>Add your next race</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Track countdown and stay focused</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>
        )}

        {/* Stats row */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, flexDirection: 'row', gap: 10 }}>
          <Stat label="This week" value="24.3" unit="mi" icon="trending-up" />
          <Stat label="Sessions" value="0" unit="booked" icon="videocam" />
          <Stat label="Recovery" value="92" unit="/100" icon="pulse" />
        </View>

        {/* Curated for you */}
        <View style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>Curated for you</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {profile.goal ? `Matched for ${profile.goal.toLowerCase()}` : 'Top experts matched to your goals'}
              </Text>
            </View>
            <Pressable><Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>See all</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, gap: 12 }}>
            {curateForAthlete(profile.goal, profile.experience).map((p) => <ProCard key={p.id} pro={p} onPress={() => router.push({ pathname: '/coach/[id]' as any, params: { id: p.id } })} />)}
          </ScrollView>
        </View>

        {/* Quick links */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 12 }}>Quick access</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <QuickLink label="My Calendar" icon="calendar" onPress={() => router.push('/(tabs)/calendar' as any)} />
            <QuickLink label="My Team" icon="people" onPress={() => router.push('/(tabs)/team' as any)} />
            <QuickLink label="My Files" icon="folder" onPress={() => router.push('/(tabs)/files' as any)} />
            <QuickLink label="Injury Tracker" icon="body" onPress={() => router.push('/(tabs)/injury' as any)} />
          </View>
        </View>
      </ScrollView>

      {/* Profile dropdown */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ position: 'absolute', top: 90, right: 16, backgroundColor: colors.bgCardElevated, borderRadius: 16, paddingVertical: 8, minWidth: 220, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{profile.firstName} {profile.lastName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{profile.experience ?? 'Athlete'}</Text>
            </View>
            <MenuItem icon="person-outline" label="Profile" />
            <MenuItem icon="card-outline" label="Subscription" />
            <MenuItem icon="notifications-outline" label="Notifications" />
            <MenuItem icon="settings-outline" label="Settings" />
            <MenuItem icon="help-circle-outline" label="Help & Support" />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
            <MenuItem icon="log-out-outline" label="Sign out" danger onPress={() => { onboardingStore.reset(); setMenuOpen(false); router.replace('/'); }} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border }}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>{value}<Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}> {unit}</Text></Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ProCard({ pro, onPress }: { pro: Pro; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ width: 220, backgroundColor: colors.bgCard, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', opacity: pressed ? 0.92 : 1 })}>
      <Image source={{ uri: pro.img }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
      <View style={{ position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: pro.role === 'PT' ? 'rgba(59,130,246,0.95)' : 'rgba(14,158,142,0.95)' }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{pro.role === 'PT' ? 'LICENSED PT' : 'COACH'}</Text>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }} numberOfLines={1}>{pro.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{pro.specialty}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{pro.rating.toFixed(1)}</Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{pro.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function QuickLink({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ width: '48%', backgroundColor: colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(14,158,142,0.15)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', flex: 1 }}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({ icon, label, danger, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; danger?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: pressed ? colors.bgCard : 'transparent' })}>
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.textSecondary} />
      <Text style={{ color: danger ? colors.danger : colors.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
