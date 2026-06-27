import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label className={`block text-sm font-semibold text-slate-700 mb-1.5 ${className}`} {...props}>
      {children}
    </label>
  );
}
