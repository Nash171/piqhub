import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'slate';
}

const styles = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/10',
  slate: 'bg-slate-900 text-white ring-slate-900/10',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-700/20',
};

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
