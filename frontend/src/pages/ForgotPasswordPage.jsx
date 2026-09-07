import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { Leaf, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password/', { email });
      setSubmitted(true);
      toast.success('Password reset instructions dispatched.');

      if (response.data?.dev_reset_link) {
        setDevResetLink(response.data.dev_reset_link);
      }
    } catch (err) {
      toast.error('Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6 fill-white/20" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your registered email and we'll send a password recovery link
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="farmer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm leading-relaxed">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              If an account is associated with <strong>{email}</strong>, a password reset email has been sent. Check your inbox and spam folder.
            </div>

            {/* Development mode direct helper */}
            {devResetLink && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left space-y-2">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                  Development Mode Helper
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Since email is running via console backend, you can test directly by clicking:
                </p>
                <a
                  href={devResetLink}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline break-all block"
                >
                  {devResetLink}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
