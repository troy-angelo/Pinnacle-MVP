import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { useAthleteProfile, onboardingStore, type SharedFile } from '../../src/lib/onboarding-store';
import { getPro } from '../../src/lib/coach-service';

type FilterType = 'All' | 'plan' | 'assessment' | 'note' | 'video' | 'invoice';

const TYPE_META: Record<SharedFile['type'], { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  plan: { label: 'Training Plan', icon: 'document-text', color: '#0E9E8E' },
  assessment: { label: 'Assessment', icon: 'clipboard', color: '#3B82F6' },
  note: { label: 'Session Notes', icon: 'create', color: '#F59E0B' },
  video: { label: 'Video', icon: 'videocam', color: '#EF4444' },
  invoice: { label: 'Invoice', icon: 'receipt', color: '#A855F7' },
};

function relativeDate(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FilesTab() {
  const profile = useAthleteProfile();
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<SharedFile | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profile.files
      .filter((f) => filter === 'All' || f.type === filter)
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
  }, [profile.files, filter, search]);

  const unreadCount = profile.files.filter((f) => f.unread).length;
  const totalSize = profile.files.length;

  const openFile = (f: SharedFile) => {
    if (f.unread) onboardingStore.markFileRead(f.id);
    setPreviewFile(f);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete file', `Remove "${name}" from your files?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onboardingStore.removeFile(id);
          setPreviewFile(null);
        },
      },
    ]);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'plan', label: 'Plans' },
    { key: 'assessment', label: 'Assessments' },
    { key: 'note', label: 'Notes' },
    { key: 'video', label: 'Videos' },
    { key: 'invoice', label: 'Invoices' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>My Files</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
          {totalSize} {totalSize === 1 ? 'file' : 'files'}
          {unreadCount > 0 ? ` • ${unreadCount} unread` : ''}
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search files"
            placeholderTextColor={colors.textTertiary}
            style={{ flex: 1, color: colors.text, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 }}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }} style={{ flexGrow: 0, marginBottom: 12 }}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => ({
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                backgroundColor: active ? colors.primary : colors.bgCard,
                borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: active ? '#fff' : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 10 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 50, paddingHorizontal: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Ionicons name="folder-open-outline" size={28} color={colors.textTertiary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
              {search ? 'No matches' : 'No files yet'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
              {search ? 'Try a different search term.' : 'Files shared by your coaches and PTs will appear here.'}
            </Text>
          </View>
        ) : (
          filtered.map((file) => {
            const meta = TYPE_META[file.type];
            const pro = getPro(file.fromProId);
            return (
              <Pressable
                key={file.id}
                onPress={() => openFile(file)}
                style={({ pressed }) => ({
                  backgroundColor: colors.bgCard, borderRadius: 16, padding: 14,
                  borderWidth: 1, borderColor: file.unread ? colors.primary + '55' : colors.border,
                  flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.92 : 1,
                })}
              >
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: meta.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800', flex: 1 }} numberOfLines={1}>{file.name}</Text>
                    {file.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} /> : null}
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }} numberOfLines={1}>
                    {meta.label}{pro ? ` • ${pro.name}` : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{relativeDate(file.sharedAt)}</Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 11 }}>•</Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{file.size}</Text>
                    {file.pages ? (
                      <>
                        <Text style={{ color: colors.textTertiary, fontSize: 11 }}>•</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '600' }}>{file.pages} pages</Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Preview modal */}
      <Modal visible={!!previewFile} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPreviewFile(null)}>
        {previewFile ? (() => {
          const meta = TYPE_META[previewFile.type];
          const pro = getPro(previewFile.fromProId);
          return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
              <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable onPress={() => setPreviewFile(null)} style={{ padding: 6 }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
                <Pressable onPress={() => confirmDelete(previewFile.id, previewFile.name)} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* File hero */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <View style={{ width: 84, height: 84, borderRadius: 22, backgroundColor: meta.color + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Ionicons name={meta.icon} size={40} color={meta.color} />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 }}>{previewFile.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>{meta.label}</Text>
                </View>

                {/* Metadata */}
                <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
                  {pro ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image source={{ uri: pro.img }} style={{ width: 36, height: 36, borderRadius: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>SHARED BY</Text>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 2 }}>{pro.name}</Text>
                      </View>
                    </View>
                  ) : null}
                  <View style={{ height: 1, backgroundColor: colors.borderSubtle }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Shared</Text>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{relativeDate(previewFile.sharedAt)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Size</Text>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{previewFile.size}</Text>
                  </View>
                  {previewFile.pages ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Pages</Text>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{previewFile.pages}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Mock preview */}
                <View style={{ marginTop: 20, backgroundColor: colors.bgCard, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border, minHeight: 200 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 }}>PREVIEW</Text>
                  {previewFile.type === 'video' ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
                      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="play" size={28} color="#fff" />
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 12 }}>Tap to play video</Text>
                    </View>
                  ) : (
                    <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                      {previewFile.type === 'plan'
                        ? 'Week 1: Base building. 4 easy runs (40-50 min), 1 long run (75 min), 2 strength sessions. Focus on consistent aerobic effort and form drills.'
                        : previewFile.type === 'assessment'
                        ? 'Gait analysis findings: slight overpronation on right foot, cadence at 168 spm (target 175+). Recommendations included on page 4.'
                        : previewFile.type === 'note'
                        ? 'Great session today. Form on hill repeats was strong. Recovery this week — keep efforts easy. Next session: tempo run.'
                        : 'Sessions: 4 × $45 = $180. Paid via card ending 4242 on Oct 28. Receipt available for download.'}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  <Pressable
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: colors.primary, borderRadius: 12,
                      paddingVertical: 12, alignItems: 'center', flexDirection: 'row',
                      justifyContent: 'center', gap: 6, opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="download" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Download</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => ({
                      flex: 1, backgroundColor: colors.bgCardElevated, borderRadius: 12,
                      paddingVertical: 12, alignItems: 'center', flexDirection: 'row',
                      justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Ionicons name="share-outline" size={16} color={colors.text} />
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '800' }}>Share</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })() : null}
      </Modal>
    </SafeAreaView>
  );
}
