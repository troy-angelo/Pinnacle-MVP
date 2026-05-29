// Simple in-memory athlete store. Holds onboarding data plus runtime state
// for saved team members, shared files, and injuries.

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

export type SavedPro = {
  id: string;
  savedAt: string; // ISO
  lastSession?: string; // ISO
  upcomingSession?: string; // ISO
  notes?: string;
};

export type SharedFile = {
  id: string;
  name: string;
  type: 'plan' | 'assessment' | 'note' | 'video' | 'invoice';
  fromProId: string;
  sharedAt: string; // ISO
  size: string;
  unread?: boolean;
  pages?: number;
};

export type BodyRegionId =
  | 'head'
  | 'neck'
  | 'left-shoulder'
  | 'right-shoulder'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'core'
  | 'lower-back'
  | 'left-hip'
  | 'right-hip'
  | 'left-quad'
  | 'right-quad'
  | 'left-hamstring'
  | 'right-hamstring'
  | 'left-knee'
  | 'right-knee'
  | 'left-calf'
  | 'right-calf'
  | 'left-shin'
  | 'right-shin'
  | 'left-ankle'
  | 'right-ankle'
  | 'left-foot'
  | 'right-foot';

export type InjuryStatus = 'active' | 'recovering' | 'resolved';
export type InjuryType =
  | 'Pain'
  | 'Tightness'
  | 'Strain'
  | 'Sprain'
  | 'Soreness'
  | 'Other';

export type Injury = {
  id: string;
  region: BodyRegionId;
  regionLabel: string;
  side: 'front' | 'back';
  type: InjuryType;
  severity: number; // 1-10
  notes?: string;
  status: InjuryStatus;
  loggedAt: string; // ISO
  updatedAt: string; // ISO
};

export type AthleteProfile = {
  firstName: string;
  lastName: string;
  birthday?: string; // ISO
  avatarUri?: string;
  experience?: ExperienceLevel;
  goal?: Goal;
  races: Race[];
  team: SavedPro[];
  files: SharedFile[];
  injuries: Injury[];
};

const seedFiles: SharedFile[] = [
  {
    id: 'f1',
    name: '12-Week Marathon Build Plan',
    type: 'plan',
    fromProId: 'c1',
    sharedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    size: '1.2 MB',
    pages: 14,
    unread: true,
  },
  {
    id: 'f2',
    name: 'Gait Analysis Report',
    type: 'assessment',
    fromProId: 'p1',
    sharedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    size: '3.8 MB',
    pages: 8,
    unread: true,
  },
  {
    id: 'f3',
    name: 'Strength Routine - Week 1',
    type: 'video',
    fromProId: 'c1',
    sharedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    size: '24 MB',
  },
  {
    id: 'f4',
    name: 'Session Notes - Oct 12',
    type: 'note',
    fromProId: 'c2',
    sharedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    size: '24 KB',
  },
  {
    id: 'f5',
    name: 'Receipt - Oct Sessions',
    type: 'invoice',
    fromProId: 'c1',
    sharedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    size: '88 KB',
  },
];

const seedTeam: SavedPro[] = [
  {
    id: 'c1',
    savedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastSession: new Date(Date.now() - 86400000 * 3).toISOString(),
    upcomingSession: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: 'Focus on tempo runs',
  },
  {
    id: 'p1',
    savedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    lastSession: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const seedInjuries: Injury[] = [
  {
    id: 'inj1',
    region: 'right-knee',
    regionLabel: 'Right Knee',
    side: 'front',
    type: 'Pain',
    severity: 4,
    notes: 'Sharp pain on descents. Started after long run last weekend.',
    status: 'active',
    loggedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'inj2',
    region: 'left-calf',
    regionLabel: 'Left Calf',
    side: 'back',
    type: 'Tightness',
    severity: 2,
    notes: 'Tight after speed work. Stretching helps.',
    status: 'recovering',
    loggedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let profile: AthleteProfile = {
  firstName: '',
  lastName: '',
  races: [],
  team: seedTeam,
  files: seedFiles,
  injuries: seedInjuries,
};

type Listener = (p: AthleteProfile) => void;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(profile));

export const onboardingStore = {
  get(): AthleteProfile {
    return profile;
  },
  update(patch: Partial<AthleteProfile>) {
    profile = { ...profile, ...patch };
    emit();
  },
  addRace(race: Race) {
    profile = { ...profile, races: [...profile.races, race] };
    emit();
  },
  removeRace(id: string) {
    profile = { ...profile, races: profile.races.filter((r) => r.id !== id) };
    emit();
  },
  saveTeamMember(proId: string) {
    if (profile.team.some((t) => t.id === proId)) return;
    profile = {
      ...profile,
      team: [...profile.team, { id: proId, savedAt: new Date().toISOString() }],
    };
    emit();
  },
  removeTeamMember(proId: string) {
    profile = { ...profile, team: profile.team.filter((t) => t.id !== proId) };
    emit();
  },
  isOnTeam(proId: string) {
    return profile.team.some((t) => t.id === proId);
  },
  markFileRead(id: string) {
    profile = {
      ...profile,
      files: profile.files.map((f) => (f.id === id ? { ...f, unread: false } : f)),
    };
    emit();
  },
  removeFile(id: string) {
    profile = { ...profile, files: profile.files.filter((f) => f.id !== id) };
    emit();
  },
  addInjury(injury: Injury) {
    profile = { ...profile, injuries: [injury, ...profile.injuries] };
    emit();
  },
  updateInjury(id: string, patch: Partial<Injury>) {
    profile = {
      ...profile,
      injuries: profile.injuries.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
      ),
    };
    emit();
  },
  removeInjury(id: string) {
    profile = {
      ...profile,
      injuries: profile.injuries.filter((i) => i.id !== id),
    };
    emit();
  },
  reset() {
    profile = {
      firstName: '',
      lastName: '',
      races: [],
      team: seedTeam,
      files: seedFiles,
      injuries: seedInjuries,
    };
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

import { useEffect, useState } from 'react';

export function useAthleteProfile() {
  const [p, setP] = useState<AthleteProfile>(onboardingStore.get());
  useEffect(() => {
    const unsub = onboardingStore.subscribe(setP);
    return () => {
      unsub();
    };
  }, []);
  return p;
}
