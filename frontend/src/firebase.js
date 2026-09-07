import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const getEnvOrStorage = (key) => {
  return localStorage.getItem(key) || import.meta.env[key] || '';
};

const firebaseConfig = {
  apiKey: getEnvOrStorage('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvOrStorage('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvOrStorage('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvOrStorage('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvOrStorage('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvOrStorage('VITE_FIREBASE_APP_ID'),
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

export { auth, googleProvider, signInWithPopup };
