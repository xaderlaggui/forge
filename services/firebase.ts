import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase project config from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app (guard against hot-reload re-init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth — use inMemoryPersistence (Firebase 12.x removed getReactNativePersistence).
// Auth state is kept alive by the onAuthStateChanged listener in _layout.tsx.
// For cross-session persistence, the auth store writes to AsyncStorage separately.
export const auth = getApps().length === 1
  ? initializeAuth(app, { persistence: inMemoryPersistence })
  : getAuth(app);

export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
