import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile, onboardingStore, type Race } from '../../src/lib/onboarding-store';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DISTANCES = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra', 'Triathlon', 'Other'];

function startOfMonth(y: number, m: number) {
  return new Date(y, m, 1);
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function CalendarTab() {
  const profile = useAthleteProfile();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);
  const [addOpen, setAddOpen] = useState(false);

  const racesByDate = useMemo(() => {
    const map: Record<string, Race[]> = {};
    profile.races.forEach((r) => {
      const key = r.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [profile.races]);

  const upcoming = useMemo(() => {
    return [...profile.races]
      .filter((r) => new Date(r.date).getTime() >= new Date(today.toDateString()).getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [profile.races]);

  const past = useMemo(() => {
    return [...profile.races]
      .filter((r) => new Date(r.date).getTime() < new Date(today.toDateString()).getTime())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [profile.races]);

  const selectedRaces = racesByDate[toISODate(selected)] ?? [];

  const goPrev = () => {
    const m = viewMonth - 1;
    if (m < 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(m);
  };
  const goNext = () => {
    const m = viewMonth + 1;
    if (m > 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(m);
  };

  // Build grid (6 rows x 7 cols)
  const firstDow = startOfMonth(viewYear, viewMonth).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  // Leading days from prev month
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth, -i);
    cells.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Calendar</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Races, sessions and milestones</Text>
        </View>
        <Pressable
          onPress={() => setAddOpen(true)}
          style={({ pressed }) => ({
            width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{MONTHS[viewMonth]} {viewYear}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable onPress={goPrev} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelected(today); }}
              style={{ paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>Today</Text>
            </Pressable>
            <Pressable onPress={goNext} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Calendar grid */}
        <View style={{ marginHorizontal: 20, backgroundColor: colors.bgCard, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {WEEKDAYS.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{d}</Text>
              </View>
            ))}
          </View>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <View key={row} style={{ flexDirection: 'row' }}>
              {cells.slice(row * 7, row * 7 + 7).map((c, i) => {
                const isToday = sameDay(c.date, today);
                const isSelected = sameDay(c.date, selected);
                const hasRace = !!racesByDate[toISODate(c.date)];
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setSelected(c.date);
                      if (c.date.getMonth() !== viewMonth) {
                        setViewMonth(c.date.getMonth());
                        setViewYear(c.date.getFullYear());
                      }
                    }}
                    style={{ flex: 1, aspectRatio: 1, padding: 3 }}
                  >
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? colors.primary : isToday ? 'rgba(14,158,142,0.12)' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#fff' : !c.inMonth ? colors.textTertiary : isToday ? colors.primary : colors.text,
                          fontSize: 14,
                          fontWeight: isToday || isSelected ? '800' : '600',
                          opacity: !c.inMonth ? 0.45 : 1,
                        }}
                      >
                        {c.date.getDate()}
                      </Text>
                      {hasRace ? (
                        <View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : colors.primary }} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected day events */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>
            {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
          </Text>
          {selectedRaces.length === 0 ? (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No events on this day</Text>
              <Pressable onPress={() => setAddOpen(true)} style={{ marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(14,158,142,0.15)' }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>+ Add race</Text>
              </Pressable>
            </View>
          ) : (
            selectedRaces.map((r) => <RaceCard key={r.id} race={r} onDelete={() => onboardingStore.update({ races: profile.races.filter((x) => x.id !== r.id) })} />)
          )}
        </View>

        {/* Upcoming */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Upcoming races</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{upcoming.length} scheduled</Text>
          </View>
          {upcoming.length === 0 ? (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <Ionicons name="trophy-outline" size={32} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>No upcoming races</Text>
              <Pressable onPress={() => setAddOpen(true)} style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Add your first race</Text>
              </Pressable>
            </View>
          ) : (
            upcoming.map((r) => <RaceCard key={r.id} race={r} showCountdown onDelete={() => onboardingStore.update({ races: profile.races.filter((x) => x.id !== r.id) })} />)
          )}
        </View>

        {/* Past */}
        {past.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 10 }}>Past races</Text>
            {past.map((r) => <RaceCard key={r.id} race={r} muted onDelete={() => onboardingStore.update({ races: profile.races.filter((x) => x.id !== r.id) })} />)}
          </View>
        ) : null}
      </ScrollView>

      <AddRaceModal
        visible={addOpen}
        defaultDate={selected}
        onClose={() => setAddOpen(false)}
        onSave={(race) => { onboardingStore.addRace(race); setAddOpen(false); }}
      />
    </SafeAreaView>
  );
}

function RaceCard({ race, showCountdown, muted, onDelete }: { race: Race; showCountdown?: boolean; muted?: boolean; onDelete: () => void }) {
  const d = new Date(race.date);
  const days = Math.ceil((d.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return (
    <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: muted ? 0.7 : 1 }}>
      <View style={{ width: 56, alignItems: 'center', backgroundColor: muted ? 'rgba(255,255,255,0.05)' : 'rgba(14,158,142,0.15)', borderRadius: 12, paddingVertical: 8 }}>
        <Text style={{ color: muted ? colors.textSecondary : colors.primary, fontSize: 11, fontWeight: '700' }}>{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
        <Text style={{ color: muted ? colors.textSecondary : colors.primary, fontSize: 20, fontWeight: '800' }}>{d.getDate()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{race.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
          {race.distance ? `${race.distance} • ` : ''}
          {showCountdown && days >= 0 ? `${days === 0 ? 'Today' : `In ${days} day${days === 1 ? '' : 's'}`}` : d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric' })}
        </Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 6 }}>
        <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

function AddRaceModal({ visible, defaultDate, onClose, onSave }: { visible: boolean; defaultDate: Date; onClose: () => void; onSave: (r: Race) => void }) {
  const [name, setName] = useState('');
  const [distance, setDistance] = useState<string | undefined>(undefined);
  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [day, setDay] = useState(defaultDate.getDate());

  const reset = () => {
    setName('');
    setDistance(undefined);
    setYear(defaultDate.getFullYear());
    setMonth(defaultDate.getMonth());
    setDay(defaultDate.getDate());
  };

  const save = () => {
    if (!name.trim()) return;
    const date = new Date(year, month, day);
    onSave({
      id: `r_${Date.now()}`,
      name: name.trim(),
      date: date.toISOString(),
      distance,
    });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Platform.OS === 'ios' ? 32 : 20, maxHeight: '90%' }}>
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 }}>Add a race</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20 }}>Track an upcoming race goal on your calendar.</Text>

            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Race name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Boston Marathon"
              placeholderTextColor={colors.textTertiary}
              style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15, marginBottom: 18 }}
            />

            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Distance</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {DISTANCES.map((d) => {
                const active = distance === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDistance(d)}
                    style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: active ? colors.primary : colors.bgCard, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Date</Text>
            <DatePickerInline year={year} month={month} day={day} onChange={(y, m, d) => { setYear(y); setMonth(m); setDay(d); }} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Pressable onPress={() => { reset(); onClose(); }} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.bgCard, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={save}
                disabled={!name.trim()}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: name.trim() ? colors.primary : colors.bgCard, alignItems: 'center', opacity: name.trim() ? 1 : 0.5 }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Save race</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DatePickerInline({ year, month, day, onChange }: { year: number; month: number; day: number; onChange: (y: number, m: number, d: number) => void }) {
  const today = new Date();
  const years = [today.getFullYear(), today.getFullYear() + 1, today.getFullYear() + 2];
  const dim = daysInMonth(year, month);
  const days = Array.from({ length: dim }, (_, i) => i + 1);

  return (
    <View style={{ gap: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {MONTHS.map((m, i) => {
          const active = i === month;
          return (
            <Pressable key={m} onPress={() => onChange(year, i, Math.min(day, daysInMonth(year, i)))} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: active ? colors.primary : colors.bgCard, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: active ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{m.slice(0, 3)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {days.map((d) => {
          const active = d === day;
          return (
            <Pressable key={d} onPress={() => onChange(year, month, d)} style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.bgCard, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: active ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{d}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {years.map((y) => {
          const active = y === year;
          return (
            <Pressable key={y} onPress={() => onChange(y, month, Math.min(day, daysInMonth(y, month)))} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: active ? colors.primary : colors.bgCard, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: active ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{y}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
