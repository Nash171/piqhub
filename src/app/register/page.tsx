'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    const result = await registerUser(formData);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      router.push('/events');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Start predicting matches and compete for the top spot on PiqHub.
          </p>
        </div>

        <Card>
          {error && <Alert message={error} type="error" />}
          <form action={handleSubmit} className={`space-y-5 ${error ? 'mt-5' : ''}`}>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required autoComplete="username" placeholder="Choose a username" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Create a password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Confirm your password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
