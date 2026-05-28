import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';

export default function InjuryTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Injury Tracker</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>Tap the body map to log an issue</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="body-outline" size={48} color={colors.textTertiary} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 16 }}>All clear</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
            Tap a body region to record pain or tightness and track recovery over time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
