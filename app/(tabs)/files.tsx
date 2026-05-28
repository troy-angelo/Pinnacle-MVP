import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';

export default function FilesTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>My Files</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Plans, assessments and notes</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="folder-open-outline" size={48} color={colors.textTertiary} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 16 }}>No files yet</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
            Files shared by your coaches and PTs will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
