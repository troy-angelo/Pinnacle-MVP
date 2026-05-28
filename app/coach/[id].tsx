import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { getPro } from '../../src/lib/coach-service';

const SESSION_TYPES = [
  { id: 'video', label: 'Video Session', icon: 'videocam' as const, duration: '45 min' },
  { id: 'chat', label: 'Live Chat', icon: 'chatbubbles' as const, duration: '30 min' },
];

const SLOTS = ['Today 5:30 PM', 'Tomorrow 7:00 AM', 'Tomorrow 6:30 PM', 'Thu 8:00 AM', 'Fri 5:00 PM', 'Sat 9:00 AM'];

export default function CoachProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pro = useMemo(() => getPro(id ?? ''), [id]);
  const [sessionType, setSessionType] = useState('video');
  const [slot, setSlot] = useState<string | null>(null);

  if (!pro) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text }}>Coach not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onBook = () => {
    if (!slot) {
      Alert.alert('Pick a time', 'Select an available slot to continue.');
      return;
    }
    Alert.alert('Booked!', `${pro.name} • ${slot}`, [
      { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') },
    ]);
  };

  const isPT = pro.role === 'PT';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: pro.img }} style={{ width: '100%', height: 320 }} resizeMode="cover" />
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,14,17,0.35)' }} />
          <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 12, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Pressable style={{ position: 'absolute', top: 12, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </Pressable>
          <View style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: isPT ? 'rgba(59,130,246,0.95)' : 'rgba(14,158,142,0.95)' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{isPT ? 'LICENSED PT' : 'COACH'}</Text>
              </View>
              {pro.availableNow && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(16,185,129,0.95)' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>AVAILABLE NOW</Text>
                </View>
              )}
            </View>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>{pro.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>{pro.specialty}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
          <StatPill icon="star" value={pro.rating.toFixed(1)} label={`${pro.reviews} reviews`} />
          <StatPill icon="briefcase" value={`${pro.yearsExperience}y`} label="Experience" />
          <StatPill icon="location" value={pro.location.split(',')[0]} label={pro.location.split(',')[1]?.trim() ?? ''} />
        </View>

        {/* Bio */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 8 }}>About</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21 }}>{pro.bio}</Text>
        </View>

        {/* Credentials */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 }}>Credentials</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {pro.credentials.map((c) => (
              <View key={c} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Session type */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 }}>Session type</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {SESSION_TYPES.map((s) => {
              const active = sessionType === s.id;
              return (
                <Pressable key={s.id} onPress={() => setSessionType(s.id)} style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: active ? 'rgba(14,158,142,0.15)' : colors.bgCard, borderWidth: 1.5, borderColor: active ? colors.primary : colors.border }}>
                  <Ionicons name={s.icon} size={20} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 8 }}>{s.label}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{s.duration} • ${pro.hourlyRate}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Available slots */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 }}>Available times</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SLOTS.map((s) => {
              const active = slot === s;
              return (
                <Pressable key={s} onPress={() => setSlot(s)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: active ? colors.primary : colors.bgCard, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                  <Text style={{ color: active ? '#fff' : colors.text, fontSize: 13, fontWeight: '700' }}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky book bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>FROM</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>${pro.hourlyRate}<Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}> /session</Text></Text>
        </View>
        <Pressable onPress={onBook} style={({ pressed }) => ({ flex: 1.4, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: pressed ? 0.9 : 1 })}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Book session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatPill({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 6 }} numberOfLines={1}>{value}</Text>
      {label ? <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 1 }} numberOfLines={1}>{label}</Text> : null}
    </View>
  );
}
