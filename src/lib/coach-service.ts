import type { Goal, ExperienceLevel } from './onboarding-store';

export type Pro = {
  id: string;
  name: string;
  role: 'Coach' | 'PT';
  specialty: string;
  rating: number;
  reviews: number;
  price: string;
  hourlyRate: number;
  img: string;
  bio: string;
  credentials: string[];
  tags: string[];
  yearsExperience: number;
  location: string;
  availableNow: boolean;
};

export const PROS: Pro[] = [
  {
    id: 'c1',
    name: 'Coach Alex Rivera',
    role: 'Coach',
    specialty: 'Marathon & PR Builder',
    rating: 4.9,
    reviews: 184,
    price: '$45/session',
    hourlyRate: 45,
    img: 'https://cdn.shipper.now/image/users/cmjd6nr540001l104hue4y69r/1779973799703-ii5isfogkd-coach-1.webp',
    bio: 'USATF Level 2 certified coach with 12+ years guiding athletes from 5K to ultra distances. Boston qualifier mentor.',
    credentials: ['USATF Level 2', 'RRCA Certified', 'BS Exercise Science'],
    tags: ['Hit a PR', 'First race', 'General fitness'],
    yearsExperience: 12,
    location: 'Boulder, CO',
    availableNow: true,
  },
  {
    id: 'c2',
    name: 'Coach Maya Chen',
    role: 'Coach',
    specialty: 'Beginner & First Race',
    rating: 4.8,
    reviews: 96,
    price: '$40/session',
    hourlyRate: 40,
    img: 'https://cdn.shipper.now/image/users/cmjd6nr540001l104hue4y69r/1779973799228-21idsmcmsqm-coach-2.webp',
    bio: 'Specialist in first-time runners and 5K/10K progressions. Patient, data-driven plans built around your life.',
    credentials: ['RRCA Certified', 'NASM-CPT'],
    tags: ['First race', 'General fitness', 'Beginner'],
    yearsExperience: 7,
    location: 'Austin, TX',
    availableNow: true,
  },
  {
    id: 'p1',
    name: 'Dr. Sarah Patel, DPT',
    role: 'PT',
    specialty: 'Running Injury Specialist',
    rating: 5.0,
    reviews: 212,
    price: '$80/session',
    hourlyRate: 80,
    img: 'https://cdn.shipper.now/image/users/cmjd6nr540001l104hue4y69r/1779973799489-s8e1egcx4l-pt-1.webp',
    bio: 'Doctor of Physical Therapy specializing in runners. Gait analysis, return-to-run protocols, and strength.',
    credentials: ['DPT', 'OCS Board Certified', 'CSCS'],
    tags: ['Injury recovery', 'Hit a PR'],
    yearsExperience: 10,
    location: 'Chicago, IL',
    availableNow: false,
  },
];

export function curateForAthlete(goal?: Goal, _exp?: ExperienceLevel): Pro[] {
  if (!goal) return PROS;
  // Injury recovery → PT first; otherwise show coaches first matching the goal.
  if (goal === 'Injury recovery') {
    return [...PROS].sort((a, b) => (a.role === 'PT' ? -1 : 1) - (b.role === 'PT' ? -1 : 1));
  }
  return [...PROS].sort((a, b) => {
    const aMatch = a.tags.includes(goal) ? 1 : 0;
    const bMatch = b.tags.includes(goal) ? 1 : 0;
    return bMatch - aMatch;
  });
}

export function getPro(id: string): Pro | undefined {
  return PROS.find((p) => p.id === id);
}
