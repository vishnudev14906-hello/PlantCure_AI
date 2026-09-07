import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    info: (msg, duration) => addToast('info', msg, duration),
    warning: (msg, duration) => addToast('warning', msg, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast notification container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              item.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : item.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100'
                : item.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {item.message}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
