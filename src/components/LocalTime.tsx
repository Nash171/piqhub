'use client';

interface LocalTimeProps {
  iso: string;
  className?: string;
}

export function LocalTime({ iso, className = '' }: LocalTimeProps) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    return <span className={className}>Invalid date</span>;
  }
  return <span className={className}>{date.toLocaleString()}</span>;
}
