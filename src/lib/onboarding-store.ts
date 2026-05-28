// Simple in-memory onboarding store (would be Zustand or Convex in production).
// We use a module-level singleton so different screens can read/write the same
// onboarding draft. AsyncStorage isn't strictly required for the demo flow.

export type ExperienceLevel = 'Beginner' | 'Recreational' | 'Competitive';
export type Goal =
  | 'First race'
  | 'Hit a PR'
  | 'General fitness'
  | 'Injury recovery';

export type Race = {
  id: string;
  name: string;
  date: string; // ISO
  distance?: string;
};

export type AthleteProfile = {
  firstName: string;
  lastName: string;
  birthday?: string; // ISO
  avatarUri?: string;
  experience?: ExperienceLevel;
  goal?: Goal;
  races: Race[];
};

let profile: AthleteProfile = {
  firstName: '',
  lastName: '',
  races: [],
};

type Listener = (p: AthleteProfile) => void;
const listeners = new Set<Listener>();

export const onboardingStore = {
  get(): AthleteProfile {
    return profile;
  },
  update(patch: Partial<AthleteProfile>) {
    profile = { ...profile, ...patch };
    listeners.forEach((l) => l(profile));
  },
  addRace(race: Race) {
    profile = { ...profile, races: [...profile.races, race] };
    listeners.forEach((l) => l(profile));
  },
  reset() {
    profile = { firstName: '', lastName: '', races: [] };
    listeners.forEach((l) => l(profile));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

import { useEffect, useState } from 'react';

export function useAthleteProfile() {
  const [p, setP] = useState<AthleteProfile>(onboardingStore.get());
  useEffect(() => {
    const unsub = onboardingStore.subscribe(setP);
    return () => { unsub(); };
  }, []);
  return p;
}
