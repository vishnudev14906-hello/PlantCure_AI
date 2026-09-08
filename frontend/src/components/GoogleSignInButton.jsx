import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { Key, ShieldAlert } from 'lucide-react';

export const GoogleSignInButton = ({ text = 'Continue with Google', redirectTo = '/' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDOZhdzs4-4vGXVwk1I58La-LpdPgaobiM');
  const [authDomain, setAuthDomain] = useState(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'plantcure-ai-9c5ac.firebaseapp.com');
  const [projectId, setProjectId] = useState(import.meta.env.VITE_FIREBASE_PROJECT_ID || 'plantcure-ai-9c5ac');

  const handleGoogleClick = async () => {
    // If Firebase is configured with an API key, run native Firebase Google Popup
    if (auth && googleProvider) {
      setLoading(true);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        // Exchange Firebase Google user with our Django backend
        const res = await googleLogin({
          email: fbUser.email,
          name: fbUser.displayName || 'Google User',
          google_id: fbUser.uid,
          photo_url: fbUser.photoURL,
        });

        setLoading(false);
        if (res.success) {
          navigate(redirectTo);
        }
      } catch (error) {
        setLoading(false);
        console.error('Firebase Google popup error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
          return; // user simply closed the popup
        }
        if (error.code === 'auth/unauthorized-domain') {
          toast.error(`Domain not authorized: Please add ${window.location.hostname} in Firebase Console -> Authentication -> Settings -> Authorized domains`);
        } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/configuration-not-found') {
          setShowFirebaseConfig(true);
        } else {
          toast.error(`Google Sign-In error: ${error.message}`);
        }
      }
      return;
    }

    // If Firebase keys are not yet configured in .env, show configuration guide
    setShowFirebaseConfig(true);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error('Please enter your Firebase API Key.');
      return;
    }
    // Store in localStorage for immediate runtime use
    localStorage.setItem('VITE_FIREBASE_API_KEY', apiKey);
    localStorage.setItem('VITE_FIREBASE_AUTH_DOMAIN', authDomain);
    localStorage.setItem('VITE_FIREBASE_PROJECT_ID', projectId);
    toast.success('Firebase config saved! Reloading to apply...');
    setShowFirebaseConfig(false);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60"
      >
        {/* Official Google multi-colored G logo */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{loading ? 'Opening Google Account Chooser...' : text}</span>
      </button>

      {/* Config Modal shown only if Firebase keys are missing */}
      {showFirebaseConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Google Auth Setup
                </h3>
              </div>
              <button
                onClick={() => setShowFirebaseConfig(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To trigger the official Google account chooser on your device via Firebase, paste your free Firebase web project config from <strong>console.firebase.google.com</strong>:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  apiKey
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  authDomain
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="your-project.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  projectId
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="your-project-id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFirebaseConfig(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                >
                  Save & Connect Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
