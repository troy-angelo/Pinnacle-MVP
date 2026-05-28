import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile, onboardingStore } from '../../src/lib/onboarding-store';
import { PROS, getPro, type Pro } from '../../src/lib/coach-service';

type Filter = 'All' | 'Coaches' | 'PTs';

function relativeDate(iso?: string) {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.round(ms / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1 && days < 14) return `In ${days} days`;
  if (days < -1 && days > -14) return `${Math.abs(days)} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TeamTab() {
  const profile = useAthleteProfile();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [search, setSearch] = useState('');

  const teamPros = useMemo(() => {
    return profile.team
      .map((s) => ({ saved: s, pro: getPro(s.id) }))
      .filter((x): x is { saved: typeof x.saved; pro: Pro } => !!x.pro)
      .filter((x) => filter === 'All' || (filter === 'Coaches' ? x.pro.role === 'Coach' : x.pro.role === 'PT'));
  }, [profile.team, filter]);

  const stats = useMemo(() => {
    const totalSessions = profile.team.filter((t) => t.lastSession).length;
    const upcoming = profile.team.filter((t) => t.upcomingSession).length;
    return { saved: profile.team.length, totalSessions, upcoming };
  }, [profile.team]);

  const discoverable = useMemo(() => {
    const onTeam = new Set(profile.team.map((t) => t.id));
    const q = search.trim().toLowerCase();
    return PROS.filter((p) => !onTeam.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q));
  }, [profile.team, search]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>My Team</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Quick rebook with your saved pros</Text>
        </View>
        <Pressable
          onPress={() => setDiscoverOpen(true)}
          style={({ pressed }) => ({
            width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Saved', value: stats.saved, icon: 'people' as const, color: colors.primary },
            { label: 'Sessions', value: stats.totalSessions, icon: 'checkmark-done' as const, color: colors.success },
            { label: 'Upcoming', value: stats.upcoming, icon: 'time' as const, color: colors.warning },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: s.color + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14 }}>
          {(['All', 'Coaches', 'PTs'] as Filter[]).map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                  backgroundColor: active ? colors.primary : colors.bgCard,
                  borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: active ? '#fff' : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Team list */}
        {teamPros.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 50, paddingHorizontal: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ionicons name="people-outline" size={28} color={colors.textTertiary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>No saved pros yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
              Tap the + button to discover coaches and PTs and add them to your team for one-tap rebooking.
            </Text>
            <Pressable
              onPress={() => setDiscoverOpen(true)}
              style={({ pressed }) => ({
                marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
                backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Discover pros</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {teamPros.map(({ pro, saved }) => (
              <Pressable
                key={pro.id}
                onPress={() => router.push(`/coach/${pro.id}` as any)}
                style={({ pressed }) => ({
                  backgroundColor: colors.bgCard, borderRadius: 18, padding: 14,
                  borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.92 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: pro.img }} style={{ width: 56, height: 56, borderRadius: 16 }} />
                    {pro.availableNow ? (
                      <View style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#7CFFB2', borderWidth: 2, borderColor: colors.bgCard }} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{pro.name}</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: pro.role === 'PT' ? 'rgba(59,130,246,0.18)' : 'rgba(14,158,142,0.18)' }}>
                        <Text style={{ color: pro.role === 'PT' ? colors.info : colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{pro.role.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{pro.specialty}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="star" size={11} color="#FBBF24" />
                        <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>{pro.rating}</Text>
                      </View>
                      <Text style={{ color: colors.textTertiary, fontSize: 11 }}>•</Text>
                      <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{pro.price}</Text>
                    </View>
                  </View>
                </View>

                {/* Session info row */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
                      Last: {saved.lastSession ? relativeDate(saved.lastSession) : '—'}
                    </Text>
                  </View>
                  {saved.upcomingSession ? (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
                        Next: {relativeDate(saved.upcomingSession)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Pressable
                    onPress={() => router.push(`/coach/${pro.id}` as any)}
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: colors.primary, borderRadius: 12,
                      paddingVertical: 10, alignItems: 'center', flexDirection: 'row',
                      justifyContent: 'center', gap: 6, opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="calendar" size={14} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Rebook</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => ({
                      width: 40, backgroundColor: colors.bgCardElevated, borderRadius: 12,
                      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() => onboardingStore.removeTeamMember(pro.id)}
                    style={({ pressed }) => ({
                      width: 40, backgroundColor: colors.bgCardElevated, borderRadius: 12,
                      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="trash-outline" size={15} color={colors.danger} />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Discover modal */}
      <Modal visible={discoverOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDiscoverOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Discover Pros</Text>
            <Pressable onPress={() => setDiscoverOpen(false)} style={{ padding: 6 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="search" size={16} color={colors.textTertiary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name or specialty"
                placeholderTextColor={colors.textTertiary}
                style={{ flex: 1, color: colors.text, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 }}
              />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 10 }}>
            {discoverable.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No more pros to add — you have them all!</Text>
              </View>
            ) : (
              discoverable.map((pro) => (
                <View key={pro.id} style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image source={{ uri: pro.img }} style={{ width: 52, height: 52, borderRadius: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }} numberOfLines={1}>{pro.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{pro.specialty}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Ionicons name="star" size={10} color="#FBBF24" />
                      <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{pro.rating} • {pro.price}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => onboardingStore.saveTeamMember(pro.id)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                      backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Add</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
