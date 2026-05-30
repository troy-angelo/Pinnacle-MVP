// Storage service — single source of truth for all data persistence.
// Screens and components MUST NOT import a storage provider directly.
// All reads/writes go through this file. Provider-specific code (AsyncStorage,
// Convex, Firebase, etc.) lives only here so it can be swapped without
// touching UI code.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onboardingStore,
  type AthleteProfile,
  type Injury,
  type Race,
  type SharedFile,
} from '../src/lib/onboarding-store';

const KEYS = {
  profile: 'pinnacle.athleteProfile',
  onboardingComplete: 'pinnacle.onboardingComplete',
} as const;

// ---------- Internal helpers ----------

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // swallow — storage is best-effort
  }
}

// ---------- Athlete profile ----------

export async function getAthleteProfile(): Promise<AthleteProfile> {
  const persisted = await readJSON<AthleteProfile>(KEYS.profile);
  if (persisted) {
    onboardingStore.update(persisted);
    return persisted;
  }
  return onboardingStore.get();
}

export async function saveAthleteProfile(
  patch: Partial<AthleteProfile>,
): Promise<AthleteProfile> {
  onboardingStore.update(patch);
  const next = onboardingStore.get();
  await writeJSON(KEYS.profile, next);
  return next;
}

export async function clearAthleteProfile(): Promise<void> {
  onboardingStore.reset();
  await AsyncStorage.removeItem(KEYS.profile);
}

// ---------- Onboarding state ----------

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.onboardingComplete);
  return v === 'true';
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboardingComplete, 'true');
}

export async function clearOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.onboardingComplete);
}

// ---------- Races ----------

export async function addRace(race: Race): Promise<void> {
  onboardingStore.addRace(race);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export async function removeRace(id: string): Promise<void> {
  onboardingStore.removeRace(id);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

// ---------- Team ----------

export async function saveTeamMember(proId: string): Promise<void> {
  onboardingStore.saveTeamMember(proId);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export async function removeTeamMember(proId: string): Promise<void> {
  onboardingStore.removeTeamMember(proId);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

// ---------- Files ----------

export async function markFileRead(id: string): Promise<void> {
  onboardingStore.markFileRead(id);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export async function removeFile(id: string): Promise<void> {
  onboardingStore.removeFile(id);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export type { SharedFile };

// ---------- Injuries ----------

export async function getInjuries(): Promise<Injury[]> {
  return onboardingStore.get().injuries;
}

export async function addInjury(injury: Injury): Promise<void> {
  onboardingStore.addInjury(injury);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export async function updateInjuryLog(
  id: string,
  patch: Partial<Injury>,
): Promise<void> {
  onboardingStore.updateInjury(id, patch);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

export async function removeInjury(id: string): Promise<void> {
  onboardingStore.removeInjury(id);
  await writeJSON(KEYS.profile, onboardingStore.get());
}

// ---------- Generic session data (post-session reports etc.) ----------

export async function saveSession(sessionId: string, data: unknown): Promise<void> {
  await writeJSON(`pinnacle.session.${sessionId}`, data);
}

export async function getSession<T = unknown>(sessionId: string): Promise<T | null> {
  return readJSON<T>(`pinnacle.session.${sessionId}`);
}

export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.profile, KEYS.onboardingComplete]);
  onboardingStore.reset();
}
