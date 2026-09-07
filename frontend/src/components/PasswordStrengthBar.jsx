import React from 'react';
import { Check, X } from 'lucide-react';

export const PasswordStrengthBar = ({ password }) => {
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const criteria = [
    { label: 'At least 8 characters', met: hasLength },
    { label: 'Contains letters (A-Z / a-z)', met: hasLetter },
    { label: 'Contains a number (0-9)', met: hasDigit },
    { label: 'Contains special symbol (!@#$%)', met: hasSpecial },
  ];

  const score = [hasLength, hasLetter, hasDigit, hasSpecial, hasUpper].filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!password) return { label: 'None', width: '0%', color: 'bg-slate-200 dark:bg-slate-700' };
    if (score <= 2) return { label: 'Weak', width: '25%', color: 'bg-red-500' };
    if (score === 3) return { label: 'Fair', width: '50%', color: 'bg-amber-500' };
    if (score === 4) return { label: 'Good', width: '75%', color: 'bg-emerald-400' };
    return { label: 'Strong', width: '100%', color: 'bg-emerald-600' };
  };

  const info = getStrengthInfo();

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{info.label}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${info.color} transition-all duration-300 rounded-full`}
          style={{ width: info.width }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 pt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
            <span className={item.met ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
