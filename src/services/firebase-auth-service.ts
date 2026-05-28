import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type AuthError,
} from 'firebase/auth';
import { getFirebaseApp } from './firebase-config';

let authInstance: Auth | null = null;
let persistenceReady: Promise<void> | null = null;

function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

async function ensureSessionPersistence(auth: Auth): Promise<void> {
  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, browserSessionPersistence);
  }

  await persistenceReady;
}

export async function signInWithFirebaseEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  await ensureSessionPersistence(auth);
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutFirebaseSession(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export function getFirebaseAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return null;
  }

  return (error as AuthError).code ?? null;
}
