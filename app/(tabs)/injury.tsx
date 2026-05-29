import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import {
  onboardingStore,
  useAthleteProfile,
  type BodyRegionId,
  type Injury,
  type InjuryStatus,
  type InjuryType,
} from '../../src/lib/onboarding-store';

type Region = {
  id: BodyRegionId;
  label: string;
  side: 'front' | 'back';
  // percentage-based positioning within body container
  top: number;
  left: number;
  width: number;
  height: number;
  shape?: 'circle' | 'rect';
};

// Regions are positioned as % within a 200x440 body silhouette container.
const FRONT_REGIONS: Region[] = [
  { id: 'head', label: 'Head', side: 'front', top: 2, left: 38, width: 24, height: 12, shape: 'circle' },
  { id: 'neck', label: 'Neck', side: 'front', top: 13, left: 42, width: 16, height: 4 },
  { id: 'left-shoulder', label: 'Left Shoulder', side: 'front', top: 16, left: 60, width: 14, height: 7 },
  { id: 'right-shoulder', label: 'Right Shoulder', side: 'front', top: 16, left: 26, width: 14, height: 7 },
  { id: 'chest', label: 'Chest', side: 'front', top: 19, left: 32, width: 36, height: 11 },
  { id: 'left-arm', label: 'Left Arm', side: 'front', top: 23, left: 72, width: 12, height: 22 },
  { id: 'right-arm', label: 'Right Arm', side: 'front', top: 23, left: 16, width: 12, height: 22 },
  { id: 'core', label: 'Core / Abs', side: 'front', top: 30, left: 34, width: 32, height: 12 },
  { id: 'left-hip', label: 'Left Hip', side: 'front', top: 42, left: 52, width: 14, height: 7 },
  { id: 'right-hip', label: 'Right Hip', side: 'front', top: 42, left: 34, width: 14, height: 7 },
  { id: 'left-quad', label: 'Left Quad', side: 'front', top: 49, left: 50, width: 16, height: 16 },
  { id: 'right-quad', label: 'Right Quad', side: 'front', top: 49, left: 34, width: 16, height: 16 },
  { id: 'left-knee', label: 'Left Knee', side: 'front', top: 65, left: 51, width: 14, height: 7 },
  { id: 'right-knee', label: 'Right Knee', side: 'front', top: 65, left: 35, width: 14, height: 7 },
  { id: 'left-shin', label: 'Left Shin', side: 'front', top: 72, left: 51, width: 14, height: 16 },
  { id: 'right-shin', label: 'Right Shin', side: 'front', top: 72, left: 35, width: 14, height: 16 },
  { id: 'left-ankle', label: 'Left Ankle', side: 'front', top: 88, left: 51, width: 14, height: 5 },
  { id: 'right-ankle', label: 'Right Ankle', side: 'front', top: 88, left: 35, width: 14, height: 5 },
  { id: 'left-foot', label: 'Left Foot', side: 'front', top: 93, left: 50, width: 16, height: 6 },
  { id: 'right-foot', label: 'Right Foot', side: 'front', top: 93, left: 34, width: 16, height: 6 },
];

const BACK_REGIONS: Region[] = [
  { id: 'head', label: 'Head (back)', side: 'back', top: 2, left: 38, width: 24, height: 12, shape: 'circle' },
  { id: 'neck', label: 'Neck', side: 'back', top: 13, left: 42, width: 16, height: 4 },
  { id: 'left-shoulder', label: 'Left Shoulder', side: 'back', top: 16, left: 26, width: 14, height: 7 },
  { id: 'right-shoulder', label: 'Right Shoulder', side: 'back', top: 16, left: 60, width: 14, height: 7 },
  { id: 'left-arm', label: 'Left Arm', side: 'back', top: 23, left: 16, width: 12, height: 22 },
  { id: 'right-arm', label: 'Right Arm', side: 'back', top: 23, left: 72, width: 12, height: 22 },
  { id: 'lower-back', label: 'Lower Back', side: 'back', top: 30, left: 34, width: 32, height: 14 },
  { id: 'left-hip', label: 'Left Glute', side: 'back', top: 44, left: 34, width: 14, height: 7 },
  { id: 'right-hip', label: 'Right Glute', side: 'back', top: 44, left: 52, width: 14, height: 7 },
  { id: 'left-hamstring', label: 'Left Hamstring', side: 'back', top: 51, left: 34, width: 16, height: 14 },
  { id: 'right-hamstring', label: 'Right Hamstring', side: 'back', top: 51, left: 50, width: 16, height: 14 },
  { id: 'left-knee', label: 'Left Knee', side: 'back', top: 65, left: 35, width: 14, height: 7 },
  { id: 'right-knee', label: 'Right Knee', side: 'back', top: 65, left: 51, width: 14, height: 7 },
  { id: 'left-calf', label: 'Left Calf', side: 'back', top: 72, left: 35, width: 14, height: 16 },
  { id: 'right-calf', label: 'Right Calf', side: 'back', top: 72, left: 51, width: 14, height: 16 },
  { id: 'left-ankle', label: 'Left Ankle', side: 'back', top: 88, left: 35, width: 14, height: 5 },
  { id: 'right-ankle', label: 'Right Ankle', side: 'back', top: 88, left: 51, width: 14, height: 5 },
  { id: 'left-foot', label: 'Left Foot', side: 'back', top: 93, left: 34, width: 16, height: 6 },
  { id: 'right-foot', label: 'Right Foot', side: 'back', top: 93, left: 50, width: 16, height: 6 },
];

const INJURY_TYPES: InjuryType[] = ['Pain', 'Tightness', 'Strain', 'Sprain', 'Soreness', 'Other'];

const STATUS_COLOR: Record<InjuryStatus, string> = {
  active: '#EF4444',
  recovering: '#F59E0B',
  resolved: '#10B981',
};

const STATUS_LABEL: Record<InjuryStatus, string> = {
  active: 'Active',
  recovering: 'Recovering',
  resolved: 'Resolved',
};

function severityColor(s: number) {
  if (s <= 3) return '#10B981';
  if (s <= 6) return '#F59E0B';
  return '#EF4444';
}

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function InjuryTab() {
  const profile = useAthleteProfile();
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [editing, setEditing] = useState<Injury | null>(null);
  const [picking, setPicking] = useState<Region | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | InjuryStatus>('all');

  const regions = side === 'front' ? FRONT_REGIONS : BACK_REGIONS;

  const visibleInjuries = useMemo(() => {
    const list =
      statusFilter === 'all'
        ? profile.injuries
        : profile.injuries.filter((i) => i.status === statusFilter);
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [profile.injuries, statusFilter]);

  const counts = useMemo(() => {
    return {
      active: profile.injuries.filter((i) => i.status === 'active').length,
      recovering: profile.injuries.filter((i) => i.status === 'recovering').length,
      resolved: profile.injuries.filter((i) => i.status === 'resolved').length,
    };
  }, [profile.injuries]);

  // Map injuries to their region marker color (highest severity wins)
  const regionMarkers = useMemo(() => {
    const map: Record<string, { count: number; severity: number; status: InjuryStatus }> = {};
    profile.injuries.forEach((inj) => {
      if (inj.status === 'resolved') return;
      if (inj.side !== side) return;
      const key = inj.region;
      const existing = map[key];
      if (!existing || inj.severity > existing.severity) {
        map[key] = { count: (existing?.count ?? 0) + 1, severity: inj.severity, status: inj.status };
      } else {
        existing.count += 1;
      }
    });
    return map;
  }, [profile.injuries, side]);

  const openNewInjury = (region: Region) => {
    setPicking(region);
  };

  const handleCreate = (type: InjuryType, severity: number, notes: string) => {
    if (!picking) return;
    const now = new Date().toISOString();
    onboardingStore.addInjury({
      id: `inj-${Date.now()}`,
      region: picking.id,
      regionLabel: picking.label.replace(' (back)', ''),
      side: picking.side,
      type,
      severity,
      notes: notes.trim() || undefined,
      status: 'active',
      loggedAt: now,
      updatedAt: now,
    });
    setPicking(null);
  };

  const handleUpdateStatus = (inj: Injury, status: InjuryStatus) => {
    onboardingStore.updateInjury(inj.id, { status });
    setEditing({ ...inj, status });
  };

  const handleDelete = (inj: Injury) => {
    Alert.alert('Delete injury?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onboardingStore.removeInjury(inj.id);
          setEditing(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
            Injury Tracker
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            Tap a body region to log an issue
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
          <StatCard label="Active" value={counts.active} color="#EF4444" />
          <StatCard label="Recovering" value={counts.recovering} color="#F59E0B" />
          <StatCard label="Resolved" value={counts.resolved} color="#10B981" />
        </View>

        {/* Front/Back toggle */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {(['front', 'back'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSide(s)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 9,
                  backgroundColor: side === s ? colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: side === s ? '#fff' : colors.textSecondary,
                    fontWeight: '700',
                    fontSize: 13,
                    textTransform: 'capitalize',
                  }}
                >
                  {s} view
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Body Map */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: colors.bgElevated,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <BodyMap regions={regions} markers={regionMarkers} onPick={openNewInjury} />
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <LegendDot color="#10B981" label="Mild 1-3" />
            <LegendDot color="#F59E0B" label="Moderate 4-6" />
            <LegendDot color="#EF4444" label="Severe 7-10" />
          </View>
        </View>

        {/* Filter */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Injury Log
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'active', 'recovering', 'resolved'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setStatusFilter(f)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: statusFilter === f ? colors.primary : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: statusFilter === f ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: statusFilter === f ? '#fff' : colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 12,
                      textTransform: 'capitalize',
                    }}
                  >
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* List */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {visibleInjuries.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.bgElevated,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={40} color={colors.textTertiary} />
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 12 }}>
                {statusFilter === 'all' ? 'No injuries logged' : `No ${statusFilter} injuries`}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                Tap any body region above to log pain or tightness.
              </Text>
            </View>
          ) : (
            visibleInjuries.map((inj) => (
              <Pressable
                key={inj.id}
                onPress={() => setEditing(inj)}
                style={{
                  backgroundColor: colors.bgElevated,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: severityColor(inj.severity) + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: severityColor(inj.severity),
                  }}
                >
                  <Text style={{ color: severityColor(inj.severity), fontWeight: '800', fontSize: 14 }}>
                    {inj.severity}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                      {inj.regionLabel}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>•</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{inj.type}</Text>
                  </View>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
                    Updated {relativeDate(inj.updatedAt)} • {inj.side === 'front' ? 'Front' : 'Back'}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: STATUS_COLOR[inj.status] + '22',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: STATUS_COLOR[inj.status], fontSize: 11, fontWeight: '700' }}>
                    {STATUS_LABEL[inj.status]}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* New injury modal */}
      <NewInjuryModal
        region={picking}
        onClose={() => setPicking(null)}
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      <EditInjuryModal
        injury={editing}
        onClose={() => setEditing(null)}
        onStatusChange={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function BodyMap({
  regions,
  markers,
  onPick,
}: {
  regions: Region[];
  markers: Record<string, { count: number; severity: number; status: InjuryStatus }>;
  onPick: (r: Region) => void;
}) {
  const W = 200;
  const H = 440;
  return (
    <View style={{ width: W, height: H, position: 'relative' }}>
      {/* Silhouette */}
      <BodySilhouette width={W} height={H} />

      {/* Tappable regions */}
      {regions.map((r) => {
        const marker = markers[r.id];
        const left = (r.left / 100) * W;
        const top = (r.top / 100) * H;
        const width = (r.width / 100) * W;
        const height = (r.height / 100) * H;
        return (
          <Pressable
            key={`${r.side}-${r.id}`}
            onPress={() => onPick(r)}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderRadius: r.shape === 'circle' ? width / 2 : 8,
              backgroundColor: marker
                ? severityColor(marker.severity) + '55'
                : 'rgba(255,255,255,0.04)',
              borderWidth: marker ? 1.5 : 1,
              borderColor: marker
                ? severityColor(marker.severity)
                : 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {marker ? (
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: severityColor(marker.severity),
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.bgElevated,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                  {marker.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function BodySilhouette({ width, height }: { width: number; height: number }) {
  // Stylized silhouette built from layered Views (no SVG dep needed)
  const fill = 'rgba(99, 102, 241, 0.10)';
  const stroke = 'rgba(99, 102, 241, 0.35)';
  const part = (style: any) => ({
    position: 'absolute' as const,
    backgroundColor: fill,
    borderColor: stroke,
    borderWidth: 1,
    ...style,
  });
  return (
    <View style={{ width, height, position: 'absolute' }}>
      {/* Head */}
      <View
        style={part({
          top: height * 0.02,
          left: width * 0.38,
          width: width * 0.24,
          height: height * 0.12,
          borderRadius: 999,
        })}
      />
      {/* Neck */}
      <View
        style={part({
          top: height * 0.13,
          left: width * 0.43,
          width: width * 0.14,
          height: height * 0.04,
          borderRadius: 6,
        })}
      />
      {/* Torso */}
      <View
        style={part({
          top: height * 0.16,
          left: width * 0.28,
          width: width * 0.44,
          height: height * 0.28,
          borderRadius: 24,
        })}
      />
      {/* Left arm */}
      <View
        style={part({
          top: height * 0.17,
          left: width * 0.15,
          width: width * 0.13,
          height: height * 0.3,
          borderRadius: 999,
        })}
      />
      {/* Right arm */}
      <View
        style={part({
          top: height * 0.17,
          left: width * 0.72,
          width: width * 0.13,
          height: height * 0.3,
          borderRadius: 999,
        })}
      />
      {/* Hips */}
      <View
        style={part({
          top: height * 0.42,
          left: width * 0.32,
          width: width * 0.36,
          height: height * 0.08,
          borderRadius: 18,
        })}
      />
      {/* Left leg */}
      <View
        style={part({
          top: height * 0.48,
          left: width * 0.34,
          width: width * 0.16,
          height: height * 0.46,
          borderRadius: 18,
        })}
      />
      {/* Right leg */}
      <View
        style={part({
          top: height * 0.48,
          left: width * 0.5,
          width: width * 0.16,
          height: height * 0.46,
          borderRadius: 18,
        })}
      />
      {/* Left foot */}
      <View
        style={part({
          top: height * 0.93,
          left: width * 0.32,
          width: width * 0.18,
          height: height * 0.06,
          borderRadius: 8,
        })}
      />
      {/* Right foot */}
      <View
        style={part({
          top: height * 0.93,
          left: width * 0.5,
          width: width * 0.18,
          height: height * 0.06,
          borderRadius: 8,
        })}
      />
    </View>
  );
}

function NewInjuryModal({
  region,
  onClose,
  onSubmit,
}: {
  region: Region | null;
  onClose: () => void;
  onSubmit: (type: InjuryType, severity: number, notes: string) => void;
}) {
  const [type, setType] = useState<InjuryType>('Pain');
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState('');

  const reset = () => {
    setType('Pain');
    setSeverity(3);
    setNotes('');
  };

  return (
    <Modal
      visible={!!region}
      transparent
      animationType="slide"
      onRequestClose={() => {
        onClose();
        reset();
      }}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 36,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Log Injury</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {region?.label.replace(' (back)', '')} • {region?.side === 'front' ? 'Front' : 'Back'}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                onClose();
                reset();
              }}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>TYPE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {INJURY_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: type === t ? colors.primary : colors.bgElevated,
                  borderWidth: 1,
                  borderColor: type === t ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: type === t ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            SEVERITY ({severity}/10)
          </Text>
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 18 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => setSeverity(n)}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: n <= severity ? severityColor(severity) : colors.bgElevated,
                  borderWidth: 1,
                  borderColor: n <= severity ? severityColor(severity) : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: n <= severity ? '#fff' : colors.textTertiary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            NOTES (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="When did it start? What aggravates it?"
            placeholderTextColor={colors.textTertiary}
            multiline
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              color: colors.text,
              fontSize: 14,
              minHeight: 80,
              textAlignVertical: 'top',
              marginBottom: 18,
            }}
          />

          <Pressable
            onPress={() => {
              onSubmit(type, severity, notes);
              reset();
            }}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Save Injury</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function EditInjuryModal({
  injury,
  onClose,
  onStatusChange,
  onDelete,
}: {
  injury: Injury | null;
  onClose: () => void;
  onStatusChange: (inj: Injury, status: InjuryStatus) => void;
  onDelete: (inj: Injury) => void;
}) {
  if (!injury) return null;
  return (
    <Modal visible={!!injury} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 36,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{injury.regionLabel}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {injury.type} • Severity {injury.severity}/10 • {injury.side === 'front' ? 'Front' : 'Back'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </Pressable>
          </View>

          {injury.notes ? (
            <View
              style={{
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>
                NOTES
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{injury.notes}</Text>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Logged</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                {relativeDate(injury.loggedAt)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textTertiary, fontSize: 11 }}>Last update</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>
                {relativeDate(injury.updatedAt)}
              </Text>
            </View>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            UPDATE STATUS
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            {(['active', 'recovering', 'resolved'] as InjuryStatus[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => onStatusChange(injury, s)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: injury.status === s ? STATUS_COLOR[s] : colors.bgElevated,
                  borderWidth: 1,
                  borderColor: injury.status === s ? STATUS_COLOR[s] : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: injury.status === s ? '#fff' : colors.text,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {STATUS_LABEL[s]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => onDelete(injury)}
            style={{
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#EF4444',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 14 }}>Delete Injury</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
