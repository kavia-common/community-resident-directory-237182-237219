'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';

// PUBLIC_INTERFACE
/**
 * Login page for user authentication
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] uppercase mb-2">
            🏢 Resident Directory
          </h1>
          <p className="text-[var(--color-text-secondary)] font-bold">Welcome Back!</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold uppercase mb-6 text-center">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error)] text-white border-2 border-[var(--color-error)] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" disabled={loading} className="w-full mb-4">
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>
          </form>

          <div className="retro-divider" />

          <p className="text-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Don&apos;t have an account? </span>
            <Link href="/register" className="text-[var(--color-primary)] font-bold hover:underline">
              REGISTER HERE
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
