import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { UserProfile, UserResources, DailyQuest, DictionaryPhrase } from '../types';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAUWzPqS6pE-gsKiT9RkIxxTB-faIE2iw8",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "edutech-e17b2.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "edutech-e17b2",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "edutech-e17b2.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "467020784418",
  appId: env.VITE_FIREBASE_APP_ID || "1:467020784418:web:c7a63a969af51de530bb7b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

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
    console.warn('Firebase signInWithPopup error:', error?.code || error?.message);
    throw error;
  }
}

function toAppUser(user: User, fallbackName?: string): FirebaseGoogleUser {
  return {
    googleId: user.uid,
    name: user.displayName || fallbackName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.photoURL || '🎓',
  };
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<FirebaseGoogleUser> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return toAppUser(cred.user, name.trim());
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseGoogleUser> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return toAppUser(cred.user);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  }
}

// ==========================================
// Cloud Firestore Real-time Sync & Storage
// ==========================================

export async function syncUserDataToFirestore(
  uid: string,
  profile: Partial<UserProfile>,
  resources?: UserResources,
  unlockedCharacters?: string[],
  quests?: DailyQuest[]
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const data: any = {
      name: profile.name || 'Ученик',
      updatedAt: new Date().toISOString(),
    };
    if (profile.email) data.email = profile.email;
    if (profile.avatar) data.avatar = profile.avatar;
    if (profile.googleId) data.googleId = profile.googleId;
    if (profile.activeCharacterId) data.activeCharacterId = profile.activeCharacterId;
    if (profile.currentStreak != null) data.currentStreak = profile.currentStreak;
    if (profile.lastStudyDate) data.lastStudyDate = profile.lastStudyDate;
    if (profile.streakDays) data.streakDays = profile.streakDays;
    if (profile.totalLessonsCompleted != null) data.totalLessonsCompleted = profile.totalLessonsCompleted;
    if (profile.totalWordsLearned != null) data.totalWordsLearned = profile.totalWordsLearned;
    if (profile.isLoggedIn != null) data.isLoggedIn = profile.isLoggedIn;

    if (resources) {
      data.xp = resources.xp;
      data.coins = resources.coins;
      data.diamonds = resources.diamonds;
      data.energy = resources.energy;
      data.maxEnergy = resources.maxEnergy;
    }
    if (unlockedCharacters) {
      data.unlockedCharacters = unlockedCharacters;
    }

    await setDoc(userRef, data, { merge: true });
  } catch (e) {
    console.warn('Firestore syncUserData error:', e);
  }
}

export async function loadUserDataFromFirestore(uid: string): Promise<any | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.warn('Firestore loadUserData error:', e);
  }
  return null;
}

export async function savePhraseToFirestore(uid: string, phrase: DictionaryPhrase): Promise<void> {
  try {
    const phraseRef = doc(db, 'users', uid, 'phrases', phrase.id);
    await setDoc(phraseRef, {
      id: phrase.id,
      userId: uid,
      language: phrase.language,
      phrase: phrase.phrase,
      kidExplanation: phrase.kidExplanation || '',
      literalMeaning: phrase.literalMeaning || '',
      sourceBook: phrase.sourceBook || '',
      example: phrase.example || '',
      dateAdded: phrase.dateAdded || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore savePhrase error:', e);
  }
}

export async function loadPhrasesFromFirestore(uid: string): Promise<DictionaryPhrase[]> {
  try {
    const phrasesCol = collection(db, 'users', uid, 'phrases');
    const snap = await getDocs(phrasesCol);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        language: data.language || 'ru',
        phrase: data.phrase || '',
        kidExplanation: data.kidExplanation || data.kid_explanation || '',
        literalMeaning: data.literalMeaning || data.literal_meaning || '',
        sourceBook: data.sourceBook || data.source_book || '',
        example: data.example || '',
        dateAdded: data.dateAdded || data.date_added || '',
      };
    });
  } catch (e) {
    console.warn('Firestore loadPhrases error:', e);
    return [];
  }
}
