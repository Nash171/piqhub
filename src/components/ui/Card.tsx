import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md hover:shadow-slate-200/60 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold tracking-tight text-slate-900 ${className}`}>{children}</h2>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;
}
