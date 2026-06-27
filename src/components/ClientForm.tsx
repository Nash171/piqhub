'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { ActionResult } from '@/lib/types';

interface ClientFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  successMessage?: string;
  onSuccess?: () => void;
  className?: string;
}

export function ClientForm({ action, children, successMessage, onSuccess, className = '' }: ClientFormProps) {
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(formData: FormData): Promise<void> {
    const res = await action(formData);
    setResult(res);
    if (res.success && onSuccess) {
      onSuccess();
    }
  }

  return (
    <form action={handleSubmit} className={className}>
      {result?.success === false && (
        <div className="mb-4">
          <Alert message={result.error} type="error" />
        </div>
      )}
      {result?.success && successMessage && (
        <div className="mb-4">
          <Alert message={result.message || successMessage} type="success" />
        </div>
      )}
      {children}
    </form>
  );
}
