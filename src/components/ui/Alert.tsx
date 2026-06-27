import React from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'info';
}

const styles = {
  error: 'bg-red-50 text-red-900 border-red-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
};

const icons = {
  error: (
    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Alert({ message, type = 'info' }: AlertProps) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}
