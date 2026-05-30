// Auth service — single source of truth for authentication.
// Screens and components MUST NOT import an auth provider directly.
// All sign-in / sign-out / session checks go through this file. Provider
// swaps (Better Auth, Clerk, Firebase, etc.) happen here only.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllStorage } from './storage';

export type UserRole = 'athlete' | 'coach' | 'pt';

export type Session = {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO
};

const SESSION_KEY = 'pinnacle.session';

type Listener = (session: Session | null) => void;
const listeners = new Set<Listener>();

let cached: Session | null | undefined = undefined;

const emit = (s: Session | null) => {
  cached = s;
  listeners.forEach((l) => l(s));
};

// ---------- Public API ----------

export async function getSession(): Promise<Session | null> {
  if (cached !== undefined) return cached;
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const parsed = raw ? (JSON.parse(raw) as Session) : null;
    cached = parsed;
    return parsed;
  } catch {
    cached = null;
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const s = await getSession();
  return s !== null;
}

export async function signIn(
  email: string,
  _password: string,
  role: UserRole = 'athlete',
): Promise<Session> {
  // Stub implementation — agency will wire to real provider inside this file.
  const session: Session = {
    userId: `user_${Date.now()}`,
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emit(session);
  return session;
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'athlete',
): Promise<Session> {
  return signIn(email, password, role);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  emit(null);
}

export async function signOut(): Promise<void> {
  await clearSession();
  await clearAllStorage();
}

export function onAuthStateChange(listener: Listener): () => void {
  listeners.add(listener);
  // Fire immediately with current state if known
  if (cached !== undefined) listener(cached);
  return () => {
    listeners.delete(listener);
  };
}

// React hook helper
import { useEffect, useState } from 'react';

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(cached);
  const [loading, setLoading] = useState(cached === undefined);

  useEffect(() => {
    let mounted = true;
    if (cached === undefined) {
      getSession().then((s) => {
        if (mounted) {
          setSession(s);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    const unsub = onAuthStateChange((s) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return { session: session ?? null, loading };
}
