import { useState } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../src/constants/theme';
import { onboardingStore, useAthleteProfile } from '../../src/lib/onboarding-store';
import { ProgressBar, Footer } from './name';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const profile = useAthleteProfile();
  const [uri, setUri] = useState<string | undefined>(profile.avatarUri);

  const pick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to set a profile image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setUri(result.assets[0].uri);
      }
    } catch {
      // fallback for web preview where picker may not work
      setUri('https://cdn.shipper.now/image/users/cmpinmadj0000jv04dnvd2tr7/1779561426202-n9noi9ng1i-athlete_avatar.webp');
    }
  };

  const next = () => {
    onboardingStore.update({ avatarUri: uri });
    router.push('/onboarding/experience');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ProgressBar step={3} total={5} />
      <View style={{ paddingHorizontal: 24, flex: 1, paddingTop: 16 }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>STEP 3 OF 5</Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>Add a profile photo</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: 40, lineHeight: 22 }}>Help your coaches recognize you on every session.</Text>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Pressable
            onPress={pick}
            style={({ pressed }) => ({
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: colors.bgCard,
              borderWidth: 2,
              borderColor: uri ? colors.primary : colors.border,
              borderStyle: uri ? 'solid' : 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {uri ? (
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Ionicons name="camera" size={36} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Tap to upload</Text>
              </View>
            )}
          </Pressable>

          {uri ? (
            <Pressable onPress={pick} style={{ marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Change photo</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <Footer onNext={next} label={uri ? 'Continue' : 'Skip for now'} />
    </SafeAreaView>
  );
}
