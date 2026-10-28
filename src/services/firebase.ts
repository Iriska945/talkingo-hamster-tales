import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyC_talkingo_dummy_key_firebase_2026",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "talkingo-app.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "talkingo-app",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "talkingo-app.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: env.VITE_FIREBASE_APP_ID || "1:1029384756:web:789abcdef0123"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface FirebaseGoogleUser {
  googleId: string;
  name: string;
  email: string;
  avatar: string;
}

export async function signInWithGoogleFirebase(): Promise<FirebaseGoogleUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user: User = result.user;
    return {
      googleId: user.uid,
      name: user.displayName || 'Google User',
      email: user.email || '',
      avatar: user.photoURL || '🎓',
    };
  } catch (error: any) {
    console.warn('Firebase signInWithPopup error or unconfigured project:', error?.code || error?.message);
    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  }
}
