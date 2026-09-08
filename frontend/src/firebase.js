import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const getEnvOrStorage = (key, fallback = '') => {
  return (typeof window !== 'undefined' && localStorage.getItem(key)) || import.meta.env[key] || fallback;
};

const firebaseConfig = {
  apiKey: getEnvOrStorage('VITE_FIREBASE_API_KEY', 'AIzaSyDOZhdzs4-4vGXVwk1I58La-LpdPgaobiM'),
  authDomain: getEnvOrStorage('VITE_FIREBASE_AUTH_DOMAIN', 'plantcure-ai-9c5ac.firebaseapp.com'),
  projectId: getEnvOrStorage('VITE_FIREBASE_PROJECT_ID', 'plantcure-ai-9c5ac'),
  storageBucket: getEnvOrStorage('VITE_FIREBASE_STORAGE_BUCKET', 'plantcure-ai-9c5ac.firebasestorage.app'),
  messagingSenderId: getEnvOrStorage('VITE_FIREBASE_MESSAGING_SENDER_ID', '238993667050'),
  appId: getEnvOrStorage('VITE_FIREBASE_APP_ID', '1:238993667050:web:plantcure'),
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
