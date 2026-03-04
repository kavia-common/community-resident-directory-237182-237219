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
 * Registration page for new users
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    unit_number: '',
    floor: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        unit_number: formData.unit_number || undefined,
        floor: formData.floor || undefined,
        phone: formData.phone || undefined,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] uppercase mb-2">
            🏢 Resident Directory
          </h1>
          <p className="text-[var(--color-text-secondary)] font-bold">Join Our Community!</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold uppercase mb-6 text-center">Register</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error)] text-white border-2 border-[var(--color-error)] font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="John Doe"
                required
              />

              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                required
              />

              <Input
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                type="text"
                label="Unit Number (Optional)"
                value={formData.unit_number}
                onChange={(e) => handleChange('unit_number', e.target.value)}
                placeholder="101"
              />

              <Input
                type="text"
                label="Floor (Optional)"
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                placeholder="1"
              />

              <Input
                type="tel"
                label="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="md:col-span-2"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mb-4 mt-4">
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </Button>
          </form>

          <div className="retro-divider" />

          <p className="text-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Already have an account? </span>
            <Link href="/login" className="text-[var(--color-primary)] font-bold hover:underline">
              LOGIN HERE
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
